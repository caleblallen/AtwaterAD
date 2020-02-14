const config = require( 'config' );
const utilities = require( './Utilities' );
const shell = require( 'node-powershell' );

class ADMediator {

    constructor() {

        this.util = new utilities().getInstance();

        this.ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );

        this.credentialCommand = `(New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList `;
        this.credentialCommand += `"${ config.get( 'LDAP.username' ) }", (ConvertTo-SecureString -String "${ config.get( 'LDAP.password' ) }" -AsPlainText -Force) )`
    }

    async userExists( username ) {
        let ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );


        // User exists if Get-ADUser returns something, rather than erroring out.
        this.ps.addCommand( `Get-ADUser -Identity "${ username }" -Credential ${ this.credentialCommand }` );
        try {
            await this.ps.invoke();
            return true;
        } catch ( err ) {
            return false;
        }
    }

    async createUser( opts ) {
        let {
            username,
            password,
            firstName,
            lastName,
            middleName,
            commonName,
            title,
            office,
            primarySite,
            description,
            displayName,
            initials,
            department,
            company,
            groups
        } = opts;
        //Pull our Site to OU Mapping from the Default Configuration
        let siteToOU = config.get( 'SiteToOU' );

        //Initialize return object
        let userCreated = {
            userName: username,
            sAMAccountName: username,
            password: password,
            commonName: commonName,
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            title: title,
            office: office,
            description: description,
            displayName: displayName,
            initials: initials,
            department: department,
            company: company,
            location: siteToOU['Lander'],
            passwordExpires: false
        };


        let cmd = `New-ADUser -SamAccountName "${ userCreated.userName }" `;
        cmd += `-UserPrincipalName "${ userCreated.userName }@${ config.get( 'Defaults.Domain' ) }" `;
        cmd += `-DisplayName "${ userCreated.firstName } ${ userCreated.lastName }" `;
        cmd += `-Name "${ userCreated.firstName } ${ userCreated.lastName }" `;
        cmd += `-GivenName "${ userCreated.firstName }" -Surname "${ userCreated.lastName }" `;
        cmd += `-Description "${ userCreated.description }" `;

        cmd += `-OtherName ${ userCreated.middleName } `;

        cmd += `-AccountPassword (ConvertTo-SecureString "${ userCreated.password }" -AsPlainText -Force) `;

        cmd += `-Title "${ userCreated.title }" `;

        cmd += `-Office "${ userCreated.office }" `;
        cmd += `-Initials "${ userCreated.initials }" `;
        cmd += `-Department "${ userCreated.department }" `;
        cmd += `-Company "${ config.get( 'CompanyName' ) }" `;
        cmd += `-Path "${ siteToOU[primarySite] }" `;
        cmd += `-CannotChangePassword ${ ( config.get( 'Defaults.UsersCanChangePasswords' ) ) ? '$False' : '$True' } `;
        cmd += `-ChangePasswordAtLogon ${ ( config.get( 'Defaults.UsersMustChangePasswordAtLogon' ) ) ? '$True' : '$False' } `;
        cmd += `-HomeDrive "${ config.get( 'Defaults.HomeDriveLetter' ) }:" `;
        cmd += `-HomeDirectory "${ config.get( 'Defaults.HomeDriveBasePath' ) }${ userCreated.userName }" `;
        cmd += `-Country "${ config.get( 'Defaults.Country' ) }" `;
        cmd += `-Credential ${ this.credentialCommand }`;

        // TODO: Handle Employee Numbers
        // cmd += `-EmployeeNumber "${ }" `;




        try {
            this.ps.addCommand( cmd );
            this.ps.addCommand( `Enable-ADAccount -Identity "${ userCreated.userName }" -Credential ${ this.credentialCommand }` );
            let output = await this.ps.invoke();
            // this.ps.dispose();
        } catch ( err ) {
            console.log( "Error in ADMediator.createUser: ", err );
        }

        await this.addUserToGroups( userCreated['sAMAccountName'], groups );

        // TODO: I'm concerned that this is not overwriting properly. Possible bug?
        userCreated['groups'] = await this.getUserGroups( userCreated['sAMAccountName'] );

        let missedGroups = groups.filter( x => !userCreated['groups'].includes( x ) );
        if ( missedGroups.length > 0 ) {
            console.warn( `WARNING: User ${ userCreated.userName } was not added to the following groups: `, missedGroups );
        }

        return userCreated;
    }

    async updateUser( usr ) {


        const shell = require( 'node-powershell' );
        let ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );


        // console.log( usr.alterations );

        if ( usr.alterations.changeName ) {

            const domainName = config.get( 'Credentials.LDAP.host' );

            const userPrincipalName = `${ usr.alterations.changeName.newUserName }@${ domainName }`;

            this.ps.addCommand( `Get-ADUser "${ usr.username }" -Credential ${ this.credentialCommand } | Set-ADUser -SamAccountName "${ usr.alterations.changeName.newUserName }" -UserPrincipalName "${ userPrincipalName }"` );
            this.ps.invoke().then( output => {
                console.log( output );
                usr.username = usr.alterations.changeName.newUserName;
            } ).catch( err => {
                if ( 'ObjectNotFound' in err ) {
                    console.log( 'object not found' );
                } else {
                    console.log( err );
                }

                return null;
                // this.ps.dispose();
            } );

        }


        return usr;
    }

    async getUser( username ) {
        this.ps.addCommand( `Get-ADUser -Identity "${ username }" -Credential ${ this.credentialCommand } | ConvertTo-Json -Compress` );
        try {
            let output = await this.ps.invoke();
            return JSON.parse( output );
        } catch ( err ) {
            console.warn( `WARNING: User ${ username } could not be retrieved: `, err.message );
            return null;
        }
    }

    async deleteUser( username ) {
        let ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );
        try {
            //Remove-ADUser -Identity 'LCazaril' -Confirm:$False
            this.ps.addCommand( `Remove-ADUser -Identity "${ username }" -Confirm:$False -Credential ${ this.credentialCommand }` );
            await this.ps.invoke();
            return { 'success': true };
        } catch ( err ) {
            console.warn( `WARNING: Could not delete user ${ username }: `, err.message );
            return { 'success': false };
        }
    }


    async getUserGroups( username ) {
        let ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );

        try {
            this.ps.addCommand( `(Get-ADPrincipalGroupMembership -Identity "${ username }" -Credential ${ this.credentialCommand } | Select -ExpandProperty Name) -join ','` );
            let output = await this.ps.invoke();
            return output.replace( /\r\n|\n|\r/gm, '' ).split( ',' );
        } catch ( err ) {
            console.log( 'Error querying user groups', err.message );
            return [];
        }
    }

    async isUserMemberOf( username, group ) {
        const grps = await this.getUserGroups( username );
        return Array.from( grps ).includes( group );

    }

    async addUserToGroups( username, groups ) {
        let ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );

        for ( let group of groups ) {
            this.ps.addCommand( `Add-ADGroupMember -Identity "${ group }" -Members "${ username }" -Credential ${ this.credentialCommand }` );
        }

        try {
            await this.ps.invoke();
        } catch ( err ) {
            console.log( `An error occured while trying to add the user ${ username } to groups: `, err.message );
            return false;
        }
        return true;
    }

    async addUserToGroup( username, group ) {
        try {
            this.ps.addCommand( `Add-ADGroupMember -Identity "${ group }" -Members "${ username }" -Credential ${ this.credentialCommand }` );
            await this.ps.invoke();
        } catch ( err ) {
            console.log( `An error occured while trying to add the user ${ username } to group ${ group }: `, err.message );
            return false;
        }
        return true;
    }

}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new ADMediator();
        }
    }

    getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;

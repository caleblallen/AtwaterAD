const config = require( 'config' );
const utilities = require( './Utilities' );


class ADMediator {

    constructor() {
        let ADModule = require( '../bin/ad' );
        this.ad = new ADModule( {
            url: 'ldaps://' + config.LDAP.host,
            user: config.LDAP.username,
            pass: config.LDAP.password,
        } );
        this.util = new utilities().getInstance();
    }

    async userExists( username ) {
        return await this.ad.user( username ).exists();
    }

    async createUser( opts ) {
        let {
            username,
            password,
            firstName,
            lastName,
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
            password: password,
            commonName: commonName,
            firstName: firstName,
            lastName: lastName,
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

        // TODO: Handle Middle Names for User Account Creation
        // cmd += `-OtherName ${ } `

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

        // TODO: Handle Employee Numbers
        // cmd += `-EmployeeNumber "${ }" `;

        console.log( cmd );

        const shell = require( 'node-powershell' );
        let ps = new shell( {
            executionPolicy: 'Bypass',
            noProfile: true
        } );

        try {
            let command = `New-ADUser`;
            ps.addCommand( cmd );
            let output = await ps.invoke();
            ps.dispose();


            /*TODO: In the event of a user with an identical commonName to another user in the 'location' OU The process will bug out. Implement Checking.*/
            // userCreated = await this.ad.user().add( {
            //     userName: username,
            //     password: password,
            //     commonName: commonName,
            //     firstName: firstName,
            //     lastName: lastName,
            //     title: title,
            //     office: office,
            //     description: description,
            //     displayName: displayName,
            //     initials: initials,
            //     department: department,
            //     company: company,
            //     location: siteToOU['Lander'],
            //     passwordExpires: false,
            // });
        } catch (err) {
            console.log("Error in ADMediator.createUser: ", err);
        }

        /*        //Extract a function set for the user we just created.
                let usr = this.ad.user( userCreated['sAMAccountName'] );

                //Initialize collector for moveOperation status.
                let moveOperation = {success: false};

                try {
                    //Attempt to move user from the Lander to the appropriate OU
                    moveOperation = await usr.move( siteToOU[primarySite] );
                } catch (err) {
                    if (err['message'].includes('ENTRY_EXISTS')) {
                        //TODO: This could be refactored to force the movement by deleting the user and then recreating with a different common name.
                        console.log(`Cannot move user from the Lander (${siteToOU['Lander']}) to appropriate OU.` +
                            `Most common cause is that a user with an identical Common Name (${userCreated['cn']}) ` +
                            `already exists in the target OU (${siteToOU[primarySite]})`);
                    } else {
                        console.log(`Error moving user from ${siteToOU['Lander']} to appropriate OU: `, err);
                    }
                }

                //Initialize flag to indicate whether the system can successfully authenticate with the new credentials.
                userCreated['canAuthenticate'] = false;
                try {
                    //TODO: Handle failure
                    userCreated['canAuthenticate'] = await usr.authenticate( password );
                } catch ( err ) {
                    console.log( "Error Authenticating user: ", err );
                }


                userCreated['moveSuccessful'] = moveOperation['success'];
                userCreated['password'] = password;

                userCreated['groups'] = [];
                for ( let g of groups ) {
                    let wasAdded = await this.addUserToGroup( userCreated['sAMAccountName'], g );
                    if ( wasAdded !== false ) {
                        userCreated['groups'].push( g );
                    } else {
                        console.warn( `Error: Was unable to add user to group: ${ g }` );
                    }
                }*/
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

            ps.addCommand( `Get-ADUser "${ usr.username }" | Set-ADUser -SamAccountName "${ usr.alterations.changeName.newUserName }" -UserPrincipalName "${ userPrincipalName }"` );
            ps.invoke().then( output => {
                console.log( output );
                usr.username = usr.alterations.changeName.newUserName;
            } ).catch( err => {
                if ( 'ObjectNotFound' in err ) {
                    console.log( 'object not found' );
                } else {
                    console.log( err );
                }

                return null;
                ps.dispose();
            } );

        }


        return usr;
    }

    async getUser( username ) {
        return await this.ad.user( username ).get();
    }

    async deleteUser( username ) {
        return await this.ad.user( username ).remove();
    }

    async getUserGroups( username ) {
        try {
            return await this.ad.user( username ).get( { fields: [ 'groups' ] } );
        } catch ( err ) {
            console.log( 'Error querying user groups', err.message );
        }
    }

    async isUserMemberOf(username, group) {
        return this.ad.user(username).isMemberOf(group);
    }

    async addUserToGroup(username, group) {
        try {
            await this.ad.user(username).addToGroup(group);
        } catch (err) {
            console.log(`An error occured while trying to add the user ${username} to group ${group}: `, err.message);
        }
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

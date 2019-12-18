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
        let userCreated = {};

        try {
            /*TODO: In the event of a user with an identical commonName to another user in the 'location' OU The process will bug out. Implement Checking.*/
            userCreated = await this.ad.user().add( {
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
                passwordExpires: false,
            });
        } catch (err) {
            console.log("Error in ADMediator.createUser: ", err);
        }

        //Extract a function set for the user we just created.
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
            }
        }
        return userCreated;
    }



    async deleteUser(username) {
        return await this.ad.user(username).remove();
    }

    async getUserGroups(username) {
        try {
            return await this.ad.user(username).get({fields: ['groups']});
        } catch (err) {
            console.log('Error querying user groups', err.message);
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

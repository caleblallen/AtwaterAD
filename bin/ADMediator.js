const config = require('config');

const ldapConfig = config.get('Credentials.LDAP');

class ADMediator {

    constructor() {
        let ADModule = require('../bin/ad');
        this.ad = new ADModule({
            url: 'ldaps://' + ldapConfig.host,
            user: ldapConfig.username,
            pass: ldapConfig.password,
        });

    }

    async userExists(username) {
        return await this.ad.user(username).exists();
    }

    async createUser(firstName, lastName, middleNames, suffix, title, primarySite, otherSites = [], eNumber = 0) {
        //Pull our Site to OU Mapping from the Default Configuration
        let siteToOU = config.get('Templates.SiteToOU');

        //Create a username following AESD Policies
        let uName = await this.generateUsername(firstName, lastName);

        if (uName === null) {
            throw `No applicable username available for ${firstName} ${lastName}`;
        }


        //Initialize return object
        let userCreated = {};

        //Collector for middle initials
        let middleInitials = "";

        //Extract middle initials.
        if (middleNames.length > 0) {
            middleInitials = middleNames.split(' ').reduce((collector, currentName) => {
                return collector + currentName.charAt(0)
            }, "");
        }

        let password = this.generatePassword(firstName, lastName);

        try {
            /*TODO: In the event of a user with an identical commonName to another user in the 'location' OU The process will bug out. Implement Checking.*/
            userCreated = await this.ad.user().add({
                userName: uName,
                password: password,
                commonName: `${firstName} ${lastName}`,
                firstName: firstName,
                lastName: lastName,
                title: title,
                office: (otherSites.length > 0) ? primarySite + " " + otherSites.join(' ') : primarySite,
                description: title,
                displayName: `${firstName} ${middleNames} ${lastName} ${suffix}`,
                initials: `${firstName.charAt(0)}${middleInitials}${lastName.charAt(0)}`,
                department: primarySite,
                company: config.get('Templates.CompanyName'),
                employeeNumber: eNumber,
                location: siteToOU['Lander'],
                passwordExpires: false,
            });
        } catch (err) {
            console.log("Error in ADMediator.createUser: ", err);
        }

        //Extract a function set for the user we just created.
        let usr = this.ad.user(userCreated['sAMAccountName']);

        //Initialize collector for moveOperation status.
        let moveOperation = {success: false};

        try {
            //Attempt to move user from the Lander to the appropriate OU
            moveOperation = await usr.move(siteToOU[primarySite]);
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
            userCreated['canAuthenticate'] = await usr.authenticate(password);
        } catch (err) {
            console.log("Error Authenticating user: ", err);
        }

        userCreated['moveSuccessful'] = moveOperation['success'];
        userCreated['password'] = password;
        return userCreated;
    }

    generatePassword(firstName, lastName) {
        return firstName.substr(0, 2) + lastName.substr(0, 2) +
            Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    async generateUsername(firstName, lastName) {
        //TODO: verify that names contain only letters and hyphens.
        let fnIndex = 1;
        while (fnIndex < firstName.length) {
            let uName = firstName.substr(0, fnIndex) + lastName;
            let isTaken = true;
            try {
                isTaken = await this.ad.user(uName).exists();
            } catch (err) {
                console.log('ADMediator.generateUsername. Error checking for username existance.', err);
            }

            if (!isTaken) {
                return uName;
            } else {
                fnIndex++;
            }
        }

        return null;
    }

    async deleteUser(username) {
        return await this.ad.user(username).remove();
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

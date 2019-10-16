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
        let siteToOU = config.get('Templates.SiteToOU')
        let uName = await this.generateUsername(firstName, lastName);

        if (uName === null) {
            throw `No applicable username available for ${firstName} ${lastName}`;
        }

        let userCreated = {};
        let password = this.generatePassword(firstName, lastName);
        try {

            let middleInitials = "";

            if (middleNames.length > 0) {
                middleInitials = middleNames.split(' ').reduce((collector, currentName) => {
                    return collector + currentName.charAt(0)
                }, "");
            }

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
                /*Adding users here to a lander and the moving them to their final destination in an separate operation.
                * Pros:
                *   1) Lowers likelihood of running into issues with duplicate Common Names.
                *   2) Prevents rights from being granted to duplicate users until the matter has been resolved.
                *
                *   3) Ensures the account is created even if subsequent operations fail. (Maybe this should just be cleaned up???)
                * Cons:
                *   1) We have to engage in a separate move operation after creation.*/
            });



        } catch (err) {
            console.log("Error in ADMediator.createUser: ", err);
        }
        //TODO: Handle failure

        try {
            const moveOperation = await this.ad.user(userCreated['sAMAccountName']).move(siteToOU[primarySite]);
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

        try {
            //TODO: Handle failure
            const canAuthenticate = await this.ad.user(userCreated['sAMAccountName']).authenticate(password);
        } catch (err) {
            console.log("Error Authenticating user: ", err);
        }

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

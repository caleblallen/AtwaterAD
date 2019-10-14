
class ADMediator {

    constructor() {
        let ADModule = require('ad');
        this.ad = new ADModule({
            url: 'ldaps://ATWATER.local',
            user: '',
            pass: '',
        });


    }

    async userExists(username) {
        return await this.ad.user(username).exists();
    }

    async createUser(firstName, lastName, title, site) {
        let siteToOU = {
            'Aileen Colburn': 'AESD/Aileen Colburn/Staff',
            'Bellevue': 'AESD/Bellevue/Staff',
            //TODO: Replace with Config File or DB Call.
        };


        let uName = await this.generateUsername(firstName, lastName);

        if (uName === null) {
            throw `No applicable username available for ${firstName} ${lastName}`;
        }

        let userCreated = {};
        let password = this.generatePassword(firstName, lastName);
        try {
            /*TODO: In the event of a user with an identical commonName to another user in the 'location' OU
            The process will bug out. Implement Checking.*/
            userCreated = await this.ad.user().add({
                userName: uName,
                password: password,
                commonName: `${firstName} ${lastName}`,
                firstName: firstName,
                lastName: lastName,
                title: title,
                location: siteToOU[site]
            });

        } catch (err) {
            console.log("Error in ADMediator.createUser: ", err);
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

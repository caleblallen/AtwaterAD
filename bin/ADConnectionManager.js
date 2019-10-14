const config = require('config');

const ldapConfig = config.get('Credentials.LDAP');


class ADConnectionManager {

    constructor() {
        let ADModule = require('ad');
        this.ad = new ADModule({
            url: 'ldaps://' + ldapConfig.host,
            user: ldapConfig.username,
            pass: ldapConfig.password,
        });
    }
}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new ADConnectionManager();
        }

    }

    static getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;

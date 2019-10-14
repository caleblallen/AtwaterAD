
class ADConnectionManager {

    constructor() {
        let ADModule = require('ad');
        this.ad = new ADModule({
            url: 'ldaps://ATWATER.local',
            user: '',
            pass: '',
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

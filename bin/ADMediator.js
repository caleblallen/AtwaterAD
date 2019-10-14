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
}

class Singleton {

    constructor() {
        console.log("````````outside instance of Constructor```````````");
        if (!Singleton.instance) {
            console.log('```````````inside instance of constructor``````````````');
            Singleton.instance = new ADMediator();
        }

    }

    getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;

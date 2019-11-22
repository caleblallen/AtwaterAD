const config = require('config');

class UserConfigBuilder {

    constructor() {

    }

}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new UserConfigBuilder();
        }
    }

    getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;

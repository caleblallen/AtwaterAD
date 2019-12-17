const utilities = require( './Utilities' );

class UserBuilder {

    constructor() {
        this.util = new utilities().getInstance();
    }


}

module.exports = UserBuilder;
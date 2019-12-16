const config = require( 'config' );

class Utilities {

    constructor() {
    }

    generatePassword( firstName, lastName ) {
        return firstName.substr( 0, 2 ) + lastName.substr( 0, 2 ) +
            Math.floor( Math.random() * 10000 ).toString().padStart( 4, '0' );
    }

}

class Singleton {

    constructor() {
        if ( !Singleton.instance ) {
            Singleton.instance = new Utilities();
        }
    }

    getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;

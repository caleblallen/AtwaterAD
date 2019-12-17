var UserBuilder = require( '../bin/UserBuilder' );
let colorTwister = require( './colorTwister' );
var should = require( 'chai' ).should();
const sinon = require( 'sinon' );


describe( 'User Builder Object should ', function () {

    before( () => {
        console.log( '\n' );
        console.log( colorTwister( 'UserBuilder Tests'.padStart( 35, '/\\' ).padEnd( 55, '/\\' ) ) );
        console.log( '\n' );
    } );

    it( 'UserBuilder object should construct without errors.', ( done ) => {

        let usr = new UserBuilder();
        done();
    } );

    it( 'UserBuilder should accept ', ( done ) => {

        let usr = new UserBuilder();
        done();
    } );

} );
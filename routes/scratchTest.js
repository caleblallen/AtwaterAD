var express = require( 'express' );
var router = express.Router();
var UserBuilder = require( '../bin/UserBuilder' );

/* GET home page. */
router.get( '/', function ( req, res, next ) {
    // res.render( '../public/index.html', {title: 'Express'});

    let usr = new UserBuilder();
    usr.addName( 'Lupe', 'Cazaril', 'dy', 'Jr.' );
    usr.addTitle( 'Custodian' );
    usr.addSite( [ 'Aileen Colburn', 'Thomas Olaeta' ] );
    usr.addDepartments( [ 'Food Services', 'Personnel' ] );
    usr.build().then( ( user ) => {
        // user.username.should.match( /^L.*Cazaril$/ );
        return new Promise( ( ( resolve, reject ) => {
            user.pushToAd().then( ( response ) => {
                resolve( user );
            } ).catch( ( e ) => {
                console.log( e.message );
                resolve( user.username );
            } );

        } ) );
    } ).then( ( userObject ) => {
        res.send( JSON.stringify( userObject ) );
    } );
    /*.then( ( userObject ) => {
        if ( typeof userObject === 'string' ) {
            Mediator.deleteUser( userObject ).then( ( deleteResult ) => {
                // deleteResult['success'].should.equal( true );
            } ).catch( ( e ) => {
                console.log( `ERROR:${ e.message }` );
            } );
        } else {
            userObject.deleteFromAd().then( ( response ) => {
                if ( !response['success'] ) {
                    console.warn( 'Warning: Could not delete ', userObject['username'] );
                }
            } ).catch( ( e ) => {
                console.warn( 'Warning: Could not delete ', e.message );
            } );
        }
    } );*/

} );

module.exports = router;

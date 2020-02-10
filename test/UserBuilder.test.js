var UserBuilder = require( '../bin/UserBuilder' );
let colorTwister = require( './colorTwister' );
var should = require( 'chai' ).should();
const sinon = require( 'sinon' );
var ADM = require( '../bin/ADMediator' );
var Mediator = new ADM().getInstance();


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

    it( 'UserBuilder should accept user information and create a user object upon "build"', ( done ) => {
        let usr = new UserBuilder();
        usr.addName( 'Lupe', 'Cazaril', 'dy', 'Jr.' );
        usr.addTitle( 'Library Media Specialist' );
        usr.addSite( 'Aileen Colburn' );
        usr.build().then( ( user ) => {
            user.username.should.match( /^L.*Cazaril$/ );
            user.password.should.match( /[A-Z][a-z][A-Z][a-z][0-9]{4}/ );
            user.firstName.should.equal( 'Lupe' );
            user.lastName.should.equal( 'Cazaril' );
            user.commonName.should.equal( 'Lupe Cazaril' );
            user.title.should.equal( 'Library Media Specialist' );
            user.description.should.equal( 'Library Media Specialist' );
            user.office.should.equal( 'Aileen Colburn' );
            user.primarySite.should.equal( 'Aileen Colburn' );
            user.department.should.equal( 'Aileen Colburn' );
            user.initials.should.equal( 'LdC' );
            user.company.should.equal( 'Atwater Elementary School District' );
            done();
        } );
        // done();
    } );

    it( 'UserBuilder should de-alias job descriptions', ( done ) => {
        let usr = new UserBuilder();
        usr.addName( 'Lupe', 'Cazaril', 'dy', 'Jr.' );
        usr.addTitle( 'Night Custodian' );
        usr.addSite( 'Aileen Colburn' );
        usr.build().then( ( user ) => {
            user.username.should.match( /^L.*Cazaril$/ );
            user.password.should.match( /[A-Z][a-z][A-Z][a-z][0-9]{4}/ );
            user.firstName.should.equal( 'Lupe' );
            user.lastName.should.equal( 'Cazaril' );
            user.commonName.should.equal( 'Lupe Cazaril' );
            user.title.should.equal( 'Custodian' );
            user.description.should.equal( 'Custodian' );
            user.office.should.equal( 'Aileen Colburn' );
            user.primarySite.should.equal( 'Aileen Colburn' );
            user.department.should.equal( 'Aileen Colburn' );
            user.initials.should.equal( 'LdC' );
            user.company.should.equal( 'Atwater Elementary School District' );
            done();
        } );
        // done();
    } );


    it( 'UserBuilder should properly note multiple sites', ( done ) => {
        let usr = new UserBuilder();
        usr.addName( 'Lupe', 'Cazaril', 'dy', 'Jr.' );
        usr.addTitle( 'Custodian' );
        usr.addSite( [ 'Aileen Colburn', 'Thomas Olaeta' ] );
        usr.build().then( ( user ) => {
            user.username.should.match( /^L.*Cazaril$/ );
            user.password.should.match( /[A-Z][a-z][A-Z][a-z][0-9]{4}/ );
            user.firstName.should.equal( 'Lupe' );
            user.lastName.should.equal( 'Cazaril' );
            user.commonName.should.equal( 'Lupe Cazaril' );
            user.title.should.equal( 'Custodian' );
            user.description.should.equal( 'Custodian' );
            user.office.should.equal( 'Aileen Colburn Thomas Olaeta' );
            user.primarySite.should.equal( 'Aileen Colburn' );
            user.department.should.equal( 'Aileen Colburn' );
            user.initials.should.equal( 'LdC' );
            user.company.should.equal( 'Atwater Elementary School District' );
            done();
        } );
    } );

    it( 'UserBuilder should interact with the Grouper to properly assign groups by department', ( done ) => {
        let usr = new UserBuilder();
        usr.addName( 'Lupe', 'Cazaril', 'dy', 'Jr.' );
        usr.addTitle( 'Custodian' );
        usr.addSite( [ 'Aileen Colburn', 'Thomas Olaeta' ] );
        usr.addDepartments( [ 'Food Services', 'Personnel' ] );
        usr.build().then( ( user ) => {
            user.username.should.match( /^L.*Cazaril$/ );
            user.password.should.match( /[A-Z][a-z][A-Z][a-z][0-9]{4}/ );
            user.firstName.should.equal( 'Lupe' );
            user.lastName.should.equal( 'Cazaril' );
            user.commonName.should.equal( 'Lupe Cazaril' );
            user.title.should.equal( 'Custodian' );
            user.description.should.equal( 'Custodian' );
            user.office.should.equal( 'Aileen Colburn Thomas Olaeta' );
            user.primarySite.should.equal( 'Aileen Colburn' );
            user.department.should.equal( 'Aileen Colburn, Food Services, Personnel' );
            user.initials.should.equal( 'LdC' );
            user.company.should.equal( 'Atwater Elementary School District' );
            user.groups.should.be.an( 'array' ).with.members( [ 'WiFi-Allowed',
                'AESD Staff',
                'Domain Users',
                'All Classified Staff',
                'Support Services Staff',
                'Aileen Colburn Staff',
                'Thomas Olaeta Staff',
                'Food Services',
                'Intranet Access',
                'SARB Members',
                'District Office Rooms' ] );
            done();
        } );
    } );

    it( 'UserBuilder push a generated user to AD, and delete user with the deleteFromAd() function', ( done ) => {
        let usr = new UserBuilder();
        usr.addName( 'Lupe', 'Cazaril', 'dy', 'Jr.' );
        usr.addTitle( 'Custodian' );
        usr.addSite( [ 'Aileen Colburn', 'Thomas Olaeta' ] );
        usr.addDepartments( [ 'Food Services', 'Personnel' ] );
        usr.build().then( ( user ) => {
            user.username.should.match( /^L.*Cazaril$/ );
            return new Promise( ( ( resolve, reject ) => {
                user.pushToAd().then( ( response ) => {
                    resolve( user );
                } ).catch( ( e ) => {
                    console.log( e.message );
                    resolve( user.username );
                } );

            } ) );
        } ).then( ( userObject ) => {
            if ( typeof userObject === 'string' ) {
                Mediator.deleteUser( userObject ).then( ( deleteResult ) => {
                    deleteResult['success'].should.equal( true );
                    done();
                } ).catch( ( e ) => {
                    console.log( `ERROR:${ e.message }` );
                    done();
                } );
            } else {
                userObject.deleteFromAd().then( ( response ) => {
                    if ( !response['success'] ) {
                        console.warn( 'Warning: Could not delete ', userObject['username'] );
                    }
                    done();
                } ).catch( ( e ) => {
                    console.warn( 'Warning: Could not delete ', e.message );
                } );
            }
        } );

    } );

    it( 'UserBuilder should extract user information from Active Directory', ( done ) => {
        let usr = new UserBuilder();

        usr.pullExistingUser( 'techservices' ).then( () => {
            usr.build().then( ( user ) => {
                console.log( user );
                user.firstName.should.equal( 'Tech' );
            } ).catch( ( err ) => {
                throw `User Build Failure: ${ err.message }`;
            } )
        } ).catch( ( err ) => {
            done( err.message );
        } ).finally( () => {
            done();
        } );

    } );
} );

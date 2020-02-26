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

    it( 'UserBuilder should properly rename users', ( done ) => {

        let original = {
            firstName: 'Bob',
            lastName: 'Marley',
            middleName: 'Lenard',
            suffix: 'Jr.',
            jobTitle: 'Library Media Specialist',
            primarySite: 'Aileen Colburn',
            userName: null
        };
        let updated = {
            firstName: 'Bob',
            lastName: 'Smith',
            middleName: 'Lenard',
            suffix: 'Sr.',
            jobTitle: 'Library Media Specialist',
            primarySite: 'Aileen Colburn',
            userName: null
        };


        let usr = new UserBuilder();
        usr.addName( original.firstName, original.lastName, original.middleName, original.suffix );
        usr.addTitle( original.jobTitle );
        usr.addSite( original.primarySite );
        usr.build().then( ( user ) => {
            return new Promise( ( resolve, reject ) => {
                user.username.should.match( new RegExp( `^${ original.firstName.charAt( 0 ) }.*${ original.lastName }$` ) );
                user.password.should.match( /[A-Z][a-z][A-Z][a-z][0-9]{4}/ );
                user.firstName.should.equal( original.firstName );
                user.lastName.should.equal( original.lastName );
                user.commonName.should.equal( `${ original.firstName } ${ original.lastName }` );
                user.title.should.equal( original.jobTitle );
                user.description.should.equal( original.jobTitle );
                user.office.should.equal( original.primarySite );
                user.primarySite.should.equal( original.primarySite );
                user.department.should.equal( original.primarySite );
                user.initials.should.equal( `${ original.firstName.charAt( 0 ) }${ original.middleName.charAt( 0 ) }${ original.lastName.charAt( 0 ) }` );
                user.company.should.equal( 'Atwater Elementary School District' );
                user.pushToAd().then( ( pushResult ) => {
                    resolve( pushResult.userName );
                } );
            } );
        } ).then( ( uName ) => {
            return new Promise( ( resolve, reject ) => {
                let originalUserBuilder = new UserBuilder();
                originalUserBuilder.pullExistingUser( uName ).then( () => {
                    originalUserBuilder.changeName( updated.firstName, updated.lastName, updated.middleName,
                        updated.suffix ).then( () => {
                        originalUserBuilder.build().then( ( alteredUser ) => {
                            alteredUser.pushToAd().then( ( newUserName ) => {
                                //Run Tests
                                let uNameRegEx = new RegExp( `${ updated.firstName.charAt( 0 ) }\w*${ updated.lastName }` );
                                newUserName.should.match( uNameRegEx );
                                resolve( newUserName );
                            } );
                        } );
                    } );
                } ).catch( ( err ) => {
                    // console.error( `Problem with name change`, err.message );
                    reject( `Problem with name change ${ err.message }` );
                } );
            } );
        } ).then( ( uName ) => {
            return new Promise( ( resolve, reject ) => {
                original.userName = uName;
                let originalUserBuilder = new UserBuilder();
                originalUserBuilder.pullExistingUser( uName ).then( () => {
                    originalUserBuilder.build().then( ( originalUser ) => {
                        originalUser.username.should.match( new RegExp( `${ updated.firstName.charAt( 0 ) }\w*${ updated.lastName }` ) );
                        originalUser.firstName.should.equal( updated.firstName );
                        originalUser.lastName.should.equal( updated.lastName );
                        originalUser.middleName.should.equal( updated.middleName );
                        originalUser.suffix.should.equal( updated.suffix );
                        originalUser.deleteFromAd().then( ( opStatus ) => {
                            opStatus.success.should.equal( true );
                            resolve();
                        } ).catch( ( err ) => {
                            reject( `Error Deleting Original User: ${ err.message }` );
                        } )
                    } ).catch( ( err ) => {
                        reject( `Error Building Original user: ${ err.message }` );
                    } );
                } ).catch( ( err ) => {
                    reject( `Error Pulling Original User Data: ${ err.message }` );
                } );
            } );
        } ).then( () => {
            done();
        } ).catch( ( err ) => {
            console.error( `Test Error: `, err );
            done( err );
        } );

    } );
} );

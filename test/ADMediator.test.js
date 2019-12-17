var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();
let colorTwister = require('./colorTwister');
var should = require('chai').should();
const sinon = require('sinon');



describe('Mediator Object should construct without errors', function () {

    before( () => {
        console.log( '\n' );
        console.log( colorTwister( 'Mediator Tests'.padStart( 35, '▀▄' ).padEnd( 55, '▄▀' ) ) );
        console.log( '\n' );
    } );

    it( 'Mediator should create and delete users without error.', ( done ) => {

        let opts = {
            username: 'SSquarepants',
            password: 'SpSq0000',
            firstName: 'Spongebob',
            lastName: 'Squarepants',
            commonName: 'Spongebob Squarepants',
            title: 'Consultant',
            office: 'Bellevue Support Services',
            primarySite: 'Bellevue',
            description: 'Consultant',
            displayName: 'Spongebob Squarepants Sr.',
            initials: 'SS',
            department: 'Bellevue Support Services',
            company: 'Atwater Elementary School District',
            groups: [ 'Wi-Fi Allowed', 'Thomas Olaeta Staff' ]
        };

        Mediator.createUser( opts ).then(
            ( result ) => {
                result['givenName'].should.equal( opts['firstName'] );
                result['sn'].should.equal( opts['lastName'] );
                result['title'].should.equal( opts['title'] );
                result['canAuthenticate'].should.equal( true );
                result['moveSuccessful'].should.equal( true );
                return result['uid'];
            }
        ).then( ( uid ) => {
            Mediator.deleteUser( uid ).then( ( res ) => {
                res['success'].should.be.equal( true );
                done();
            } )
        } );
    } );

    it( 'Mediator should add a user to groups array', ( done ) => {
        let opts = {
            username: 'SRectanglebreeches',
            password: 'SpSq0000',
            firstName: 'Spongebob',
            lastName: 'Rectanglebreeches',
            commonName: 'Spongebob Rectanglebreeches',
            title: 'Consultant',
            office: 'Bellevue Support Services',
            primarySite: 'Bellevue',
            description: 'Consultant',
            displayName: 'Spongebob Rectanglebreeches Sr.',
            initials: 'SS',
            department: 'Bellevue Support Services',
            company: 'Atwater Elementary School District',
            groups: [ 'Wi-Fi Allowed', 'Thomas Olaeta Staff' ]
        };

        let uid;
        Mediator.createUser( opts ).then(
            ( result ) => {
                result['givenName'].should.equal( opts['firstName'] );
                result['sn'].should.equal( opts['lastName'] );
                result['title'].should.equal( opts['title'] );
                result['canAuthenticate'].should.equal( true );
                result['moveSuccessful'].should.equal( true );
                uid = result['uid'];
            }
        ).then( () => {
            return new Promise( ( resolve, reject ) => {
                Mediator.addUserToGroup( uid, 'WiFi-Allowed' ).then( ( result ) => {
                    result.should.be.equal( true );
                    resolve( true );
                } ).catch( ( err ) => {
                    console.log( err.message );

                    resolve( false )
                } )
            } )
        } ).then( ( grpWasAdded ) => {
            if ( grpWasAdded ) {
                return new Promise( ( resolve, reject ) => {
                    Mediator.isUserMemberOf( uid, 'WiFi-Allowed' ).then( ( result ) => {
                        result.should.equal( true );
                        resolve( true );

                    } )
                } )
            } else {
                return new Promise( ( resolve, reject ) => {
                    resolve( false );
                } )
            }
        } ).finally( ( success ) => {
            console.log( "UID = ", uid );
            Mediator.deleteUser( uid ).then( ( res ) => {
                res['success'].should.be.equal( true );
                done();
            } )
        } );
    } );
    /*

        it('Mediator should add a user to groups array', (done) => {
                let fn = 'Spongebob';
                let ln = 'Ovalbreeches';
                let t = 'Consultant';
                let st = 'Bellevue';
                let mn = 'William Robert';
                let suf = 'Sr.';
                let uid = '';

                Mediator.createUser(fn, ln, mn, suf, t, st).then(
                    (result) => {
                        result['givenName'].should.equal(fn);
                        result['sn'].should.equal(ln);
                        result['title'].should.equal(t);
                        result['canAuthenticate'].should.equal(true);
                        result['moveSuccessful'].should.equal(true);
                        uid = result['uid'];
                    }
                ).then(() => {
                    return new Promise((resolve, reject) => {
                        Mediator.addUserToGroup(uid, 'WiFi-Allowed').then((result) => {
                            result.should.be.equal(true);
                            resolve(true);
                        }).catch((err) => {
                            console.log(err.message);

                            resolve(false)
                        })
                    })
                }).then((grpWasAdded) => {
                    if (grpWasAdded) {
                        return new Promise((resolve, reject) => {
                            Mediator.isUserMemberOf(uid, 'WiFi-Allowed').then((result) => {
                                result.should.equal(true);
                                resolve(true);

                            })
                        })
                    } else {
                        return new Promise((resolve, reject) => {
                            resolve(false);
                        })
                    }
                }).finally((success) => {
                    console.log("UID = ", uid);
                    Mediator.deleteUser(uid).then((res) => {
                        res['success'].should.be.equal(true);
                        done();
                    })
                });
        });
        it('Mediator should add a user to groups array', (done) => {
            let fn = 'Spongebob';
            let ln = 'Ovalbreeches';
            let t = 'Consultant';
            let st = 'Bellevue';
            let mn = 'William Robert';
            let suf = 'Sr.';

            let uid = '';

            Mediator.createUser(fn, ln, mn, suf, t, st).then(
                (result) => {
                    result['givenName'].should.equal(fn);
                    result['sn'].should.equal(ln);
                    result['title'].should.equal(t);
                    result['canAuthenticate'].should.equal(true);
                    result['moveSuccessful'].should.equal(true);
                    uid = result['uid'];
                }
            ).then(() => {
                return new Promise((resolve, reject) => {
                    Mediator.addUserToGroup(uid, 'WiFi-Allowed').then((result) => {
                        result.should.be.equal(true);
                        resolve(true);
                    }).catch((err) => {
                        console.log(err.message);
                        resolve(false)
                    })
                })
            }).then((grpWasAdded) => {
                if (grpWasAdded) {
                    return new Promise((resolve, reject) => {
                        Mediator.isUserMemberOf(uid, 'WiFi-Allowed').then((result) => {
                            result.should.equal(true);
                            resolve(true);

                        })
                    })
                } else {
                    return new Promise((resolve, reject) => {
                        resolve(false);
                    })
                }
            }).then((grpWasAdded) => {
                if (grpWasAdded) {
                    return new Promise((resolve, reject) => {
                        Mediator.isUserMemberOf(uid, 'Domain Admins').then((result) => {
                            result.should.equal(false);
                            resolve(true);
                        })
                    })
                } else {
                    return new Promise((resolve, reject) => {
                        resolve(false);
                    })
                }
            }).finally((success) => {
                console.log("UID = ", uid);
                Mediator.deleteUser(uid).then((res) => {
                    res['success'].should.be.equal(true);
                    done();
                })
            });
        });*/
});
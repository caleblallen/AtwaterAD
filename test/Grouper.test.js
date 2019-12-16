var Grouper = require( '../bin/Grouper' );
let colorTwister = require( './colorTwister' );
var should = require( 'chai' ).should();
const sinon = require( 'sinon' );


console.log( '\n' );
console.log( colorTwister( 'Grouper Tests'.padStart( 35, ' ▀█▄' ).padEnd( 55, '▄█▀ ' ) ) );
console.log( '\n' );

describe( 'Grouper Object should correctly parse user groups for job description', function () {

    it( 'Grouper should construct a user with basic information', ( done ) => {
        let grpr = new Grouper();
        grpr.setTitle( 'School Office Manager' );
        grpr.setSite( 'Thomas Olaeta' );
        grpr.getGroups().should.be.an( 'array' ).with.members( [ "WiFi-Allowed", "AESD Staff",
            "Domain Users", "All Classified Staff", "All Aeries Users", "Aeries Secretaries", "All Office Staff",
            "Thomas Olaeta Staff" ] );
        done();
    } );

    it( 'Grouper should construct a user with basic information, regardless of which order info is added', ( done ) => {
        let grpr = new Grouper();
        grpr.setSite( 'Thomas Olaeta' );
        grpr.setTitle( 'School Office Manager' );
        grpr.getGroups().should.be.an( 'array' ).with.members( [ "WiFi-Allowed", "AESD Staff",
            "Domain Users", "All Classified Staff", "All Aeries Users", "Aeries Secretaries", "All Office Staff",
            "Thomas Olaeta Staff" ] );
        done();
    } );

    it( 'Grouper should construct with tiered job titles.', ( done ) => {
        let grpr = new Grouper();
        grpr.setTitle( [ 'Teacher', 'Kindergarten' ] );
        grpr.setSite( 'Thomas Olaeta' );
        grpr.getGroups().should.be.an( 'array' ).with.members( [ "WiFi-Allowed", "AESD Staff",
            "Domain Users", "All AESD Kindergarten Teachers",
            "ALL AESD Teachers", "All Aeries Users", "Thomas Olaeta Staff" ] );
        done();
    } );
    /*    it('Mediator should create and delete users without error.', (done) => {
            let fn = 'Spongebob';
            let ln = 'Squarepants';
            let t = 'Consultant';
            let st = 'Bellevue';
            let mn = 'William Robert';
            let suf = 'Sr.';

            Mediator.createUser(fn, ln, mn, suf, t, st).then(
                (result) => {
                    result['givenName'].should.equal(fn);
                    result['sn'].should.equal(ln);
                    result['title'].should.equal(t);
                    result['canAuthenticate'].should.equal(true);
                    result['moveSuccessful'].should.equal(true);
                    return result['uid'];
                }
            ).then((uid) => {
                Mediator.deleteUser(uid).then((res) => {
                    res['success'].should.be.equal(true);
                    done();
                })
            });
        });

        it('Mediator should create users with the same name. At least 2 with identical OU and Common Name.', (done) => {
            let fn = 'Patrick';
            let ln = 'Star';
            let t = 'Consultant';
            let st = 'Thomas Olaeta';
            let mn = 'Bill Reginald';
            let suf = 'Jr.';

            let uName1 = '';
            let uName2 = '';

            Mediator.createUser(fn, ln, mn, suf, t, st).then(
                (result) => {
                    result['givenName'].should.equal(fn);
                    result['sn'].should.equal(ln);
                    result['title'].should.equal(t);
                    result['canAuthenticate'].should.equal(true);
                    result['moveSuccessful'].should.equal(true);
                    uName1 = result['uid'];
                }
            ).then(() => {
                Mediator.createUser(fn, ln, mn, suf, t, st).then(
                    (result) => {
                        result['givenName'].should.equal(fn);
                        result['sn'].should.equal(ln);
                        result['title'].should.equal(t);
                        result['canAuthenticate'].should.equal(true);
                        result['moveSuccessful'].should.equal(false);
                        uName2 = result['uid'];
                    }
                ).then(() => {
                    Mediator.deleteUser(uName1).then((res) => {
                        res['success'].should.be.equal(true);
                        Mediator.deleteUser(uName2).then((res) => {
                            res['success'].should.be.equal(true);
                            done();
                        })
                    })
                });
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
} );
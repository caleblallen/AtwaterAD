var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();
let colorTwister = require('./colorTwister');
var should = require('chai').should();
const sinon = require('sinon');




console.log('\n');
console.log(colorTwister('Mediator Tests'.padStart(35, '▀▄').padEnd(55, '▄▀')));
console.log('\n');

describe('Mediator Object should construct without errors', function () {


    /*        // add a test hook
            before( () => {
                console.log('\n');
                console.log('Mediator Tests'.padStart(35, '▀▄').padEnd(55, '▄▀'));
                console.log('\n');
            });*/


    it('Mediator should create and delete users without error.', (done) => {
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
    /*    it('Mediator should add a user to groups array', (done) => {
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
            ).then( (uid) => {
                let getGroupsStub = sinon.stub(Mediator,'getUserGroups').returns(["WiFi-Allowed", "AESD Staff", "Domain Users","SARB Members"]);


            }).then((uid) => {
                Mediator.deleteUser(uid).then((res) => {
                    res['success'].should.be.equal(true);
                    done();
                })
            });
        });*/
});
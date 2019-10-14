var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();

var should = require('chai').should();

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

        Mediator.createUser(fn, ln, t, st).then(
            (result) => {
                result['givenName'].should.equal(fn);
                result['sn'].should.equal(ln);
                result['title'].should.equal(t);
                return result['uid'];
            }
        ).then((uid) => {
            Mediator.deleteUser(uid).then((res) => {
                res['success'].should.be.equal(true);
                done();
            })
        });
    });
    /*    it('Mediator should handle similar common names..', (done) => {
            let fn = 'Spongebob';
            let ln = 'Squarepants';
            let t = 'Consultant';
            let st = 'Bellevue';

            Mediator.createUser(fn,ln,t,st).then(
                (result) => {
                    result['givenName'].should.equal(fn);
                    result['sn'].should.equal(ln);
                    result['title'].should.equal(t);
                    return result['uid'];
                }
            ).then( (uid) => {
                Mediator.deleteUser(uid).then( (res) => {
                    res['success'].should.be.equal(true);
                    done();
                })
            });
        });*/
});
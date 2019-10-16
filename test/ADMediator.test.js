var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();

var should = require('chai').should();


var colorTwister = (inputText) => {
    let colors = ["\x1b[32m", "\x1b[33m", "\x1b[34m", "\x1b[35m", "\x1b[36m", "\x1b[37m"];
    let ret = "";
    for (s in inputText) {
        ret += "\x1b[40m" + colors[Math.floor(Math.random() * colors.length)] + inputText.charAt(s) + "\x1b[0m";
    }


    return ret;
};


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
                return result['uid'];
            }
        ).then((uid) => {
            Mediator.deleteUser(uid).then((res) => {
                res['success'].should.be.equal(true);
                done();
            })
        });
    });
    /* it('Mediator should handle similar common names..', (done) => {
         // let fn = 'Spongebob';
         // let ln = 'Squarepants';
         // let t = 'Consultant';
         // let st = 'Bellevue';
         //
         // Mediator.createUser(fn,ln,t,st)
         //     .then( (result) => {
         //         result['givenName'].should.equal(fn);
         //         result['sn'].should.equal(ln);
         //         result['title'].should.equal(t);
         //         return result['uid'];
         //     })
         //     .then( (uid1) => {
         //         Mediator.createUser(fn,ln,t,st)
         //             .then( (secondResult) => {
         //                 result['givenName'].should.equal(fn);
         //                 result['sn'].should.equal(ln);
         //                 result['title'].should.equal(t);
         //                 result['uid'].should.not.be.equal(uid1);
         //                 return result['uid']
         //             }).then( (uid2) => {
         //                 Mediator.deleteUser(uid1).then( (delResult1) => {
         //                     delResult1['success'].should.be.equal(true);
         //                     Mediator.deleteUser(uid2).then( (delResult2) => {
         //                         delResult2['success'].should.be.equal(true);
         //                     })
         //                     }
         //                 )
         //             done();
         //         })
         //
         // });

     });*/
});
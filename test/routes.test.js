const request = require('supertest');
const server = require('../bin/www');
//const express = require('');
const app = require('../app');

//encodings = require('../node_modules/iconv-lite/encodings');
var should = require('chai').should();
var numbers = [1, 2, 3, 4, 5];

console.log('\n');
console.log('Running Route Tests'.padStart(35, '╤═╧═').padEnd(55, '═╧═╤'));
console.log('\n');

describe('Root Connectivity Test', function () {

    /*
        // add a test hook
        beforeEach(function() {
            // ...some logic before each test is run
        })
    */

    it('The Server should Respond to GET Requests to the Root Directory.', function (done) {
        // add an assertion
        request(app).get('/').end((err, res) => {
            if (err) return done(err);
            res.statusCode.should.equal(200);
            done();
        });
    })


});

describe('/userExists Test', function () {

    let url = '/userExists';

    it(`The Server should Respond to GET Requests to the "${url}" route.`, function (done) {
        // add an assertion
        request(app).get(url).end((err, res) => {
            if (err) return done(err);
            res.statusCode.should.equal(200);
            done();
        });
    });

    it(`${url} should respond with {exists: true} when sent {username: techservices}.`, function (done) {
        // add an assertion
        request(app).post(url)
            .set('Accept', 'application/json')
            .send({username: "techservices"})
            .end((err, res) => {
                if (err) return done(err);
                res.statusCode.should.equal(200);
                res.type.should.equal('application/json');
                res.body.exists.should.equal(true);
                done();
            });
    });

    it(`${url} should respond with {exists: false} when sent {username: ""}.`, function (done) {
        // add an assertion
        request(app).post(url)
            .set('Accept', 'application/json')
            .send({username: ""})
            .end((err, res) => {
                if (err) return done(err);
                res.statusCode.should.equal(200);
                res.type.should.equal('application/json');
                res.body.exists.should.equal(false);
                done();
            });
    });

    it(`${url} should with an error if the request schema is incorrect.`, function (done) {
        // add an assertion
        request(app).post(url)
            .set('Accept', 'application/json')
            .send({wrongKey: ""})
            .end((err, res) => {
                if (err) return done(err);
                res.statusCode.should.equal(400);
                res.type.should.equal('application/json');
                res.body.error.should.equal("Improper Request Schema");
                done();
            });
    });

});


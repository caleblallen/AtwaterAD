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

    it( 'Grouper should interpret aliased job titles..', ( done ) => {
        let grpr = new Grouper();
        grpr.setTitle( 'Night Custodian' );
        grpr.setSite( 'Thomas Olaeta' );
        grpr.getGroups().should.be.an( 'array' ).with.members( [ "WiFi-Allowed", "AESD Staff", "Domain Users",
            "All Classified Staff", "Support Services Staff", "Thomas Olaeta Staff" ] );
        done();
    } );

    it( 'Grouper should interpret complex, aliased job titles..', ( done ) => {
        let grpr = new Grouper();
        grpr.setTitle( [ 'ELA', 'Eighth Grade' ] );
        grpr.setSite( 'Thomas Olaeta' );

        grpr.getGroups().should.be.an( 'array' ).with.members( [ "WiFi-Allowed", "AESD Staff", "Domain Users",
            "All AESD 8th ELA Teachers", "All AESD 7-8th-Grade Teachers",
            "ALL AESD Teachers", "All Aeries Users", "Thomas Olaeta Staff" ] );
        done();
    } );

} );
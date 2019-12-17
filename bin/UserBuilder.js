const utilities = require( './Utilities' );
const grpr = require( './Grouper' );
const config = require( 'config' );
const adm = require( '../bin/ADMediator' );

class UserBuilder {

    constructor() {
        this.mediator = new adm().getInstance();
        this.util = new utilities().getInstance();
        this.grouper = new grpr();

        this.firstName = null;
        this.lastName = null;
        this.middleName = null;
        this.commonName = null;
        this.initials = null;
        this.displayName = null;
        this.username = null;
        this.password = null;
        this.title = null;
        this.description = null;
        this.primarySite = null;
        this.otherSites = null;
        this.departments = null;
        this.company = config.get( 'CompanyName' );
        this.location = null;

    }

    addName( firstName, lastName, middleName, suffix = '' ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;

        //Collector for middle initials
        let middleInitials = "";

        //Extract middle initials.
        if ( this.middleName.length > 0 ) {
            middleInitials = this.middleName.split( ' ' ).reduce( ( collector, currentName ) => {
                return collector + currentName.charAt( 0 )
            }, "" );
        }

        this.initials = `${ firstName.charAt( 0 ) }${ middleInitials }${ lastName.charAt( 0 ) }`;

        this.password = this.util.generatePassword( this.firstName, this.lastName );

        this.displayName = `${ this.firstName } ${ this.middleName } ${ this.lastName } ${ suffix }`;

        this.commonName = `${ this.firstName } ${ this.lastName }`;
    }

    addTitle( title ) {
        this.description = this.title = title;
        this.grouper.setTitle( title );
    }

    addSite( site ) {

        if ( Array.isArray( site ) ) {
            this.primarySite = site[0];
            this.otherSites = site.slice( 1 );
        } else {
            this.primarySite = site;
        }

        this.grouper.setSite( site, true );

        this.office = ( Array.isArray( this.otherSites ) ) ? this.primarySite + " " + this.otherSites.join( ' ' ) : this.primarySite;
        this.departments = ( this.departments === null ) ? [ this.primarySite ] : [ this.primarySite, ...this.departments ];

    }


    addDepartments( dept ) {

        if ( Array.isArray( dept ) ) {
            dept.forEach( d => this.addDepartments( d ) );
        } else {
            this.departments = ( this.departments === null ) ? [ dept ] : [ ...this.departments, dept ];
        }

    }

    async generateUsername() {
        //TODO: verify that names contain only letters and hyphens.
        let fnIndex = 1;
        while ( fnIndex < this.firstName.length ) {
            let uName = this.firstName.substr( 0, fnIndex ) + this.lastName;
            let isTaken = true;
            try {
                isTaken = await this.mediator.userExists( uName );
            } catch ( err ) {
                console.log( 'ADMediator.generateUsername. Error checking for username existence.', err );
            }

            if ( !isTaken ) {
                return uName;
            } else {
                fnIndex++;
            }
        }

        return null;
    }

    async build() {
        return await ( async () => {
            try {
                let ret = {
                    username: await this.generateUsername(),
                    password: this.password,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    commonName: this.commonName,
                    title: this.title,
                    office: this.office,
                    primarySite: this.primarySite,
                    description: this.description,
                    displayName: this.displayName,
                    initials: this.initials,
                    department: this.departments.join( ', ' ),
                    company: this.company,
                    groups: this.grouper.getGroups()
                };
                return ret;
            } catch ( e ) {
                console.log( e.message );
                return null;
            }
        } )();
    }


    // setSite
    // setDepartment
    // setName
    // setTitle
    // generatePassword
    // sd

    //     userName: uName,
    ////////////     password: pass,
    ////////////     commonName: `${ firstName } ${ lastName }`,
    //////////// firstName: firstName,
    //////////// lastName: lastName,
    //////////// title: title,
    //////////// office: ( otherSites.length > 0 ) ? primarySite + " " + otherSites.join( ' ' ) : primarySite,
    //////////// description: title,
    //////////// displayName: `${ firstName } ${ middleNames } ${ lastName } ${ suffix }`,
    //////////// initials: `${ firstName.charAt( 0 ) }${ middleInitials }${ lastName.charAt( 0 ) }`,
    //////////// department: primarySite,
    // company: config.get( 'CompanyName' ),
    // employeeNumber: eNumber,
    // location: siteToOU['Lander'],
    // passwordExpires: false,


}

module.exports = UserBuilder;
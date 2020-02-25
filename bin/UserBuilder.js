const config = require( 'config' );
const utilities = require( './Utilities' );
const grpr = require( './Grouper' );
const adm = require( '../bin/ADMediator' );

class UserBuilder {

    constructor() {
        this.mediator = new adm().getInstance();
        this.util = new utilities().getInstance();
        this.grouper = new grpr();
        this.office = null;
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
        this.alterations = null;
    }

    async pullExistingUser( userName ) {
        // TODO: Should I be checking like this first? Or is the extraction enough?

        let usr = null;
        try {
            usr = await this.mediator.getUser( userName );
        } catch ( e ) {
            throw `Unable extract user information from active directory. User does not exist? ${ e.message }`;
        }

        this.username = userName;

        try {
            usr.groups = await this.mediator.getUserGroups( this.username );
        } catch ( e ) {
            throw `Unable extract user group membership: ${ e.message }`;
        }

        /*usr.groups.filter( g => config.get( 'StickyGroups' ).includes( g.cn ) )
            .map( g => this.grouper.addGroupByName( g.cn ) );
*/
        // Extract any name included in the display name, but not already accounted for as Given and Sur names
        const middleNameMatcher = new RegExp( `${ usr.GivenName } (.*?) *${ usr.Surname }` ).exec( usr.Name );

        // console.log( middleNameMatcher );

        let middleName = ( middleNameMatcher == null ) ? '' : middleNameMatcher[1];

        // Add extracted names to the builder.
        this.addName( usr.GivenName, usr.Surname, middleName );

        this.alterations = {};

        // console.log( this );
    }

    async changeName( newFirstName, newLastName, newMiddleName, newSuffix, forcedUserName = null ) {

        let newUName;
        if ( forcedUserName !== null ) {
            newUName = forcedUserName;
        } else {
            newUName = await this.generateUsername( ( newFirstName ) ? newFirstName : this.firstName,
                ( newLastName ) ? newLastName : this.lastName );
        }
        this.alterations['changeName'] = {
            newFirstName: newFirstName,
            newLastName: newLastName,
            newMiddleName: newMiddleName,
            newSuffix: newSuffix,
            newUserName: newUName,
        };
    }

    addName( firstName, lastName, middleName, suffix = '' ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName === null ? '' : middleName;

        //Collector for middle initials
        let middleInitials = "";

        //Extract middle initials.
        if ( this.middleName !== null ) {
            middleInitials = this.middleName.split( ' ' ).reduce( ( collector, currentName ) => {
                return currentName === '' ? collector : collector + currentName.charAt( 0 );
            }, "" );
        }

        this.initials = `${ firstName.charAt( 0 ) }${ middleInitials }${ lastName.charAt( 0 ) }`;

        this.password = this.util.generatePassword( this.firstName, this.lastName );

        this.displayName = `${ this.firstName } ${ this.middleName } ${ this.lastName } ${ suffix }`;

        this.commonName = `${ this.firstName } ${ this.lastName }`;
    }

    addTitle( title ) {
        this.grouper.setTitle( title );
        // We use grouper here because it has the logic for de-aliasing a job title.
        this.description = this.title = this.grouper.getTitle();
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
            this.grouper.addDepartment( dept );
        }

    }

    async generateUsername( firstName = this.firstName, lastName = this.lastName ) {
        //TODO: verify that names contain only letters and hyphens.
        let fnIndex = 1;
        while ( fnIndex < firstName.length ) {
            let uName = firstName.substr( 0, fnIndex ) + lastName;
            let isTaken = true;
            try {
                isTaken = await this.mediator.userExists( uName );
            } catch ( err ) {
                console.error( 'ADMediator.generateUsername. Error checking for username existence.', err );
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
                let userObject = {
                    username: ( this.username === null ) ? await this.generateUsername() : this.username,
                    password: this.password,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    middleName: this.middleName,
                    commonName: this.commonName,
                    title: this.title,
                    office: this.office,
                    primarySite: this.primarySite,
                    description: this.description,
                    displayName: this.displayName,
                    initials: this.initials,
                    department: ( this.departments !== null ) ? this.departments.join( ', ' ) : null,
                    company: this.company,
                    groups: this.grouper.getGroups(),
                    mediator: new adm().getInstance(),
                    alterations: this.alterations,
                    pushToAd: async function () {
                        return await ( ( this.alterations !== null ) ?
                            this.mediator.updateUser( this ) : this.mediator.createUser( this ) );
                    },
                    deleteFromAd: async function () {
                        return await this.mediator.deleteUser( this.username );
                    }
                };
                return await userObject;
            } catch ( e ) {
                console.error( e.message );
                return null;
            }
        } )();
    }


}

module.exports = UserBuilder;

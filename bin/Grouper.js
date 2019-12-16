const config = require( 'config' );
const utilities = require( './Utilities' );

class Grouper {
    constructor() {
        this.title = null;
        this.dept = null;
        this.groups = [];
        this.site = null;

        this.util = new utilities().getInstance();
    }

    // Preferred Method for pulling the list of user groups.
    getGroups() {
        if ( this.site === null ) {
            console.warn( `WARNING: The job title ${ this.title } expects a school site to be set. 
            Groups returned will not include the appropriate school site groups.` );
        }

        return this.groups;
    }

    setSite( site ) {
        this.site = site;
        this.addGroupsForSite();
        return true;
    }

    addGroupsForSite() {
        if ( this.site === null ) {
            return false;
        } else {
            let siteKey = this.site.replace( ' ', '' );
            // Add Site Packages, if available.
            if ( config.has( `JobTitles.${ this.getTitle( '.' ) }` ) && config.get( `GroupPackages.Sites` ).hasOwnProperty( siteKey ) ) {
                if ( config.get( `JobTitles.${ this.getTitle( '.' ) }.Departments` ).includes( "SchoolSite" ) ) {
                    this.groups = this.groups.concat( config.get( `GroupPackages.Sites.${ siteKey }` ) );
                    return true;
                }
            } else {
                console.warn( `Warning: Grouper.addGroupsForSite() No configuration for site ${ this.site }` );
                return false;
            }
        }
    }

    setTitle( jobTitle ) {

        this.title = jobTitle;

        console.log( `======Job Title: ${ this.title }` );

        if ( !Array.isArray( this.title ) ) {
            if ( config.has( `Aliases.${ jobTitle }` ) ) {

                let deAliasedTitle = config.get( `Aliases.${ jobTitle }` );
                console.warn( `Job Title Alias Detected. Resetting ${ jobTitle } to ${ deAliasedTitle }` );

                if ( deAliasedTitle.includes( '.' ) ) {
                    this.setTitle( deAliasedTitle.split( '.' ) );
                } else {
                    this.setTitle( deAliasedTitle );
                }
            } else {
                this.addGroupsForTitle( jobTitle );
            }
        } else {
            // console.log( config.has( `Aliases.${ jobTitle[0] }` ) );
            // console.log( config.get( `Aliases.${ jobTitle[0] }` ).split('.').concat(jobTitle.slice(1)) );
            if ( config.has( `Aliases.${ jobTitle[0] }` ) ) {
                this.setTitle( config.get( `Aliases.${ jobTitle[0] }` ).split( '.' ).concat( jobTitle.slice( 1 ) ) );
            } else {
                this.addGroupsForTitle( jobTitle );

            }
        }

    }

    getTitle( joinChar = ' ' ) {
        if ( Array.isArray( this.title ) ) {
            return this.title.join( joinChar );
        } else {
            return this.title;
        }
    }


    addGroupsForTitle( jobTitle ) {
        if ( Array.isArray( jobTitle ) ) {
            // Handle Complicated Templates
            jobTitle = jobTitle.join( '.' );
            console.log( jobTitle );
        }

        if ( typeof ( jobTitle ) === 'string' ) {
            // Handle Simple Templates
            if ( config.has( `JobTitles.${ jobTitle }` ) ) {
                // Grab template in friendly variable name.
                let template = config.get( `JobTitles.${ jobTitle }` );

                // Add flat groups.
                this.groups = this.groups.concat( template.Groups );

                // Add groups related to job duties.
                for ( let p of template.Packages ) {
                    this.groups = this.groups.concat( config.get( `GroupPackages.${ p }` ) );
                }

                // Add groups related to the job's department.
                for ( let d of template.Departments ) {

                    // SchoolSite is special because there are 8 options and each has a different set.
                    if ( d === 'SchoolSite' ) {
                        this.addGroupsForSite();
                    } else {
                        this.groups = this.groups.concat( config.get( `GroupPackages.Departments.${ d }` ) );
                    }
                }
            } else {
                if ( config.has( `Aliases.${ jobTitle }` ) ) {
                    this.addGroupsForTitle( config.get( `Aliases.${ jobTitle }` ) );
                } else {
                    console.warn( `Warning: This system is unaware of the ${ this.title } job title.
                    No template to apply.` );
                }

            }
        } else {


            throw `Grouper.setTitle() invalid input. Got ${ typeof ( jobTitle ) }. Expected string or array.`
        }
    }
}

module.exports = Grouper;

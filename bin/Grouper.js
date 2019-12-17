const config = require( 'config' );
const utilities = require( './Utilities' );

class Grouper {
    constructor() {
        this.title = null;
        this.dept = [];
        this.groups = new Set();
        this.site = null;

        this.util = new utilities().getInstance();
    }

    // Preferred Method for pulling the list of user groups.
    getGroups() {
        return [ ...this.groups ];
    }

    setTitle( jobTitle ) {

        this.title = jobTitle;
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
            if ( config.has( `Aliases.${ jobTitle[0] }` ) ) {
                this.setTitle( config.get( `Aliases.${ jobTitle[0] }` ).split( '.' ).concat( jobTitle.slice( 1 ) ) );
            } else {
                this.addGroupsForTitle( jobTitle );

            }
        }

    }

    setSite( site, force = false ) {

        this.site = site;
        this.addGroupsForSite( force );
        return true;
    }

    getTitle( joinChar = ' ' ) {
        if ( Array.isArray( this.title ) ) {
            return this.title.join( joinChar );
        } else {
            return this.title;
        }
    }

    addGroupsForSite( force ) {
        if ( this.site === null ) {
            return false;
        } else {
            let siteKey = this.site.replace( ' ', '' );
            // Add Site Packages, if available.

            // TODO: Refactor for cleaner flow. If statements can be consolidated.
            if ( config.has( `JobTitles.${ this.getTitle( '.' ) }` ) &&
                config.get( `GroupPackages.Sites` ).hasOwnProperty( siteKey ) ) {
                if ( config.get( `JobTitles.${ this.getTitle( '.' ) }.Departments` ).includes( "SchoolSite" ) ) {
                    config.get( `GroupPackages.Sites.${ siteKey }` ).forEach( i => this.groups.add( i ) );
                }
            } else if ( force && config.get( `GroupPackages.Sites` ).hasOwnProperty( siteKey ) ) {
                config.get( `GroupPackages.Sites.${ siteKey }` ).forEach( i => this.groups.add( i ) );

            } else {
                console.warn( `Warning: Grouper.addGroupsForSite() No configuration for site ${ this.site }` );
                return false;
            }
            return true;
        }
    }

    addGroupsForTitle( jobTitle ) {
        if ( Array.isArray( jobTitle ) ) {
            // Handle Complicated Templates
            jobTitle = jobTitle.join( '.' );
        }

        if ( typeof ( jobTitle ) === 'string' ) {
            // Handle Simple Templates
            if ( config.has( `JobTitles.${ jobTitle }` ) ) {
                // Grab template in friendly variable name.
                let template = config.get( `JobTitles.${ jobTitle }` );

                // Add flat groups.
                template.Groups.forEach( i => this.groups.add( i ) );

                // Add groups related to job duties.
                for ( let p of template.Packages ) {
                    config.get( `GroupPackages.${ p }` ).forEach( i => this.groups.add( i ) );
                }

                // Add groups related to the job's department.
                for ( let d of template.Departments ) {

                    // SchoolSite is special because there are 8 options and each has a different set.
                    if ( d === 'SchoolSite' ) {
                        this.addGroupsForSite();
                    } else {
                        config.get( `GroupPackages.Departments.${ d }` ).forEach( i => this.groups.add( i ) );
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

    addDepartment( department ) {
        if ( Array.isArray( department ) ) {
            for ( let d of department ) {
                this.addDepartment( d );
            }
        } else {
            this.addGroupsForDepartment( department );
        }
    }

    addGroupsForDepartment( department ) {
        if ( !config.has( `GroupPackages.Departments.${ department }` ) ) {
            console.warn( `Warning: Invalid Department ${ department }` );
        } else {
            config.get( `GroupPackages.Departments.${ department }` ).forEach( i => this.groups.add( i ) );
        }
    }

    addGroupForPackages( packages ) {
        let pack = packages;
        if ( !Array.isArray( packages ) ) {
            pack = [ packages ];
        }

        for ( let p of pack ) {
            if ( config.has( `GroupPackages.${ packages }` ) ) {
                config.get( `GroupPackages.${ packages }` ).forEach( i => this.groups.add( i ) );
            }
        }
    }

    addGroupByName( name ) {
        this.groups.add( name );
    }


    /*    build() {
            return {
              title: this.title,
              department: (() => {
                  return this.dept.join(', ');
              })(),

            };
        }*/

}

module.exports = Grouper;

const config = require('config');

let mongoose = require('mongoose');


/*AesdLogger is our custom logging application.
*
*
* It provides a log() method and a logger() middleware.*/
class AesdLogger {


    constructor() {
        console.log( config.logDB.username );

        /*Connect to the log database, using the configuration saved for the current environment.*/
        mongoose.connect( `mongodb://${ config.logDB.username }:${ config.logDB.password }@${ config.logDB.host }:${ config.logDB.port }/${ config.logDB.name }`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } );
        this.db = mongoose.connection;
        this.db.on( 'error', console.error.bind( console, 'connection error:' ) );
        this.db.once( 'open', () => {
            console.log( 'Database Connection Achieved' );
        });

        this.activeDirectoryLogSchema = new mongoose.Schema({
            "createdAt": {type: Date, default: Date.now},
            "logEvent": String,
            "logMessage": String,
            "requestBody": Object,
            "requestHeaders": Object,
            "severityLevel": Number
        }, {collection: 'active_directory'});

        this.ActiveDirectoryLogEntry = new mongoose.model('AtwaterAD_entry', this.activeDirectoryLogSchema);

        this.severityLevels = {
            'debug': 7,
            'informational': 6,
            'notice': 5,
            'warning': 4,
            'error': 3,
            'critical': 2,
            'alert': 1,
            'emergency': 0
        }
    }

    getLogger(severity = 'error') {
        if (!Object.keys(this.severityLevels).includes(severity)) {
            severity = 'error';
        }
        return (req, res, next) => {
            /* We log any entries that are configured by our environment configuration. */
            if (this.severityLevels[severity.toLocaleLowerCase()] <= config.logLevel) {
                let ob = new this.ActiveDirectoryLogEntry({
                    "logEvent": "httpRequest",
                    "logMessage": "Server Received an HTTP Request",
                    "requestBody": (typeof req.body === 'undefined') ? {} : req.body,
                    "requestHeaders": req.headers,
                    "severityLevel": this.severityLevels['informational']
                });

                ob.save((err) => {
                    if (err) console.log(err);
                });
            }

            next();

        }
    }
}

module.exports = AesdLogger;

const config = require('config');

/*Shoggoth is our custom logging application.
*
* It provides a log() method and a logger() middleware.*/
class Shoggoth {

    constructor() {
        let mongoose = require('mongoose');

        /*        this.observationSchema = new mongoose.Schema({
                    ""
                });*/

        console.log(config.logDB);
        mongoose.connect(`mongodb://${config.logDB.username}:${config.logDB.password}@${config.logDB.host}:${config.logDB.port}/${config.logDB.name}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        //s
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => {
            console.log('Database Connection Achieved')
        })
    }

    logger(req, res, next) {
        console.log(req.body);
        next();
    }
}

module.exports = Shoggoth;
var express = require('express');
var router = express.Router();

//Import Singleton Active Directory Mediator.
var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();


var validateRequestSchema = require('../bin/inputFilters').validateRequestSchema;

/* Verify that a username exists */
router.post('/', validateRequestSchema(['username']), async (req, res, next) => {

    try {
        let uExists = await Mediator.userExists(req.body.username);
        res.json({
            exists: uExists
        })
    } catch (err) {
        console.log('Error retrieving User List', err);
        res.status(500);
    }
});

router.get('/', (req, res, next) => {
    res.send("The resource does not support GET requests.");
});

module.exports = router;

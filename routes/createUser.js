var express = require('express');
var router = express.Router();

//Import Singleton Active Directory Mediator.
//TODO: Examine this import. Feels messy.
var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();

/*Import Filter*/
var validateRequestSchema = require('../bin/inputFilters').validateRequestSchema;


/* Verify that a username exists */
router.post('/',
    validateRequestSchema(['firstName', 'lastName', 'middleNames', 'suffix', 'otherSites', 'employeeNumber', 'title', 'primarySite']),
    async (req, res, next) => {

        //firstName, lastName, middleNames, suffix, title, primarySite, otherSites = [], eNumber = 0
        let result = await Mediator.createUser(req.body['firstName'], req.body['lastName'], req.body["middleNames"],
            req.body["suffix"], req.body['title'], req.body['primarySite'], req.body['otherSites'], req.body['employeeNumber']);
    res.json(result);
});

router.get('/', (req, res, next) => {
    res.send("The resource does not support GET requests.");
});


module.exports = router;

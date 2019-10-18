let express = require('express');
let router = express.Router();

//Import Singleton Active Directory Mediator.
//TODO: Examine this import. Feels messy.
let ADM = require('../bin/ADMediator');
let Mediator = new ADM().getInstance();

/*Import Filter*/
let validateRequestSchema = require('../bin/inputFilters').validateRequestSchema;

let RequiredKeys = ['firstName', 'lastName', 'middleNames', 'suffix', 'otherSites', 'employeeNumber', 'title', 'primarySite'];

router.post('/', validateRequestSchema(RequiredKeys), async (req, res, next) => {
    try {
        let result = await Mediator.createUser(req.body['firstName'], req.body['lastName'], req.body["middleNames"],
            req.body["suffix"], req.body['title'], req.body['primarySite'], req.body['otherSites'], req.body['employeeNumber']);
        res.json(result);
    } catch (err) {
        res.json({
            error: true,
            errorMessage: "Unable to create user: " + err,
            dataReceived: req.body
        })
    }

});

router.get('/', (req, res, next) => {
    res.send("The resource does not support GET requests.");
});


module.exports = router;

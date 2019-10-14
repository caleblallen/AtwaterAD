var express = require('express');
var router = express.Router();

//Import Singleton Active Directory Mediator.
//TODO: Examine this import. Feels messy.
var ADM = require('../bin/ADMediator');
var Mediator = new ADM().getInstance();

/*Import Filter*/
var validateRequestSchema = require('../bin/inputFilters').validateRequestSchema;


/* Verify that a username exists */
router.post('/', validateRequestSchema(['firstName']), async (req, res, next) => {

    //let ad = connMgr.getInstance().ad;

    //For now, just send the body back.
    res.json(req.body);
});

router.get('/', (req, res, next) => {
    res.send("The resource does not support GET requests.");
});


module.exports = router;

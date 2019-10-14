var express = require('express');
var router = express.Router();

//Import Singleton Connection Mangager for Active Directory
var connMgr = require('../bin/ADConnectionManager');

var validateRequestSchema = require('../bin/inputFilters').validateRequestSchema;


/* Verify that a username exists */
router.post('/', validateRequestSchema(['firstName']), async (req, res, next) => {

    let ad = connMgr.getInstance().ad;

    res.send('got here');
});

router.get('/', (req, res, next) => {
    res.send("The resource does not support GET requests.");
});


module.exports = router;

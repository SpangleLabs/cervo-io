var express = require('express');
var router = express.Router();

/* GET zoos listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a list of zoos?');
});

module.exports = router;

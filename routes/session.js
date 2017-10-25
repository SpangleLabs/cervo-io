var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
    //TODO return the current session status?
});

router.post('/', function(req, res, next) {
    res.json({
        "auth_token": "ba3cb855-91f0-4025-9e13-2a35c7c6fc36"
    });
    //TODO login
});

router.delete('/', function(req, res, next) {
    //TODO logout
});

module.exports = router;

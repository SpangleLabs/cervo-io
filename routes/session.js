var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
    //TODO return the current session status? (Provided they give auth header, obviously)
});

router.post('/', function(req, res, next) {
    res.json({
        "auth_token": "ba3cb855-91f0-4025-9e13-2a35c7c6fc36",
        "expiry_date": "2017-10-25T21:16:57",
        "ip_addr": "127.0.0.1"
    });
    //TODO login
    // Get password from post data
    // Hash password
    // Get hashed password from database, provided it's not locked
    // Ensure hashes match
    /// ***
    // Generate auth token
    // Store auth token in database
    // Store auth token IP in database
    // Store auth token expiry in database (1 day?)
    // Set failed logins to 0

    // ***If fail:
    // Increment failed attempts
    // If failed attempts is 3, set unlock time in a couple hours
});

router.delete('/', function(req, res, next) {
    //TODO logout
    // Blank token, password in database

});

//TODO: handy check login function?
// Check auth header is provided
// Check expiry isn't in the past
// Check auth header token matches database token
module.exports = router;

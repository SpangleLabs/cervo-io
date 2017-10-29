var express = require('express');
var Session = require("../models/Session");
var router = express.Router();
var bcrypt = require("bcrypt");
var Promise = require("promise");
var uuidv4 = require("uuid/v4");

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
    // Get password from post data
    const username = res.body.username;
    const password = res.body.password;
    // Get hashed password from database, provided it's not locked
    Session.getValidPasswordHash(username).then(function(storeResult) {
        if (storeResult.length !== 1 || !storeResult[0]["value"]) {
            return Promise.reject();
        }
        // Check password against stored hash
        return bcrypt.compare(password, storeResult);
    }).then(function(compareResult) {
        if (!compareResult) {
            return Promise.reject();
        } else {
            return Promise.resolve(compareResult);
        }
    }).catch(function(err) {
        //TODO fail stuff
        // Increment failed attempts, and if failed attempts is 3, set unlock time in an hour.
        return Session.setFailedLogin(username).then(function(response) {
            res.status(403);
            return Promise.reject();
        });
    }).then(function(compareResult) {
        // Set failed logins to 0
        return Session.resetFailedLogins(username);
    }).then(function(result) {
        // Generate auth token
        const authToken = uuidv4();
        // Get IP address
        const ipAddr = req.headers["x-forwarded-for"] || req.connection._remoteAddress;
        // Create expiry time
        const expiryTime = new Date().getTime() + 86400;
        // Store auth token, IP, etc in database
        return Session.createSession(username, authToken, expiryTime, ipAddr).then(function(sessionResult) {
            const sessionResponse = {
                "auth_token": authToken,
                "expiry_date": expiryTime,
                "ip_addr": ipAddr,
                "username": username
            };
            res.json(sessionResponse);
        });
    });
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

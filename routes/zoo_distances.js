var express = require('express');
var Zoos = require("../models/Zoos.js");
var Species = require("../models/Species.js");
var Promise = require("promise");
var router = express.Router();
var Postcode = require("postcode");
var UserPostcodes = require("../models/UserPostcodes.js");

function getOrFindDistancePromise(postcodeId, zooId) {

    //return an object with postcode id, zoo id, distance (metres)
    var response = {};
    response.zoo_id = zooId;
    response.user_postcode_id = postcodeId;
    response.metres = 0;
    return response;
}
/* GET zoo distances. */
router.get('/:postcode/:zooIdList', function(req, res, next) {
    var postcode = new Postcode(req.params.postcode);
    // Validate postcode
    if(!postcode.valid()) {
        res.status(500).send("Invalid postcode");
    }
    // Get postcode sector
    var sector = postcode.sector();
    // Split up zoo id list
    var zooIdList = req.params.zooIdList.split(",");
    // Check for postcode id?
    UserPostcodes.getUserPostcodeByPostcodeSector(sector).catch(function(err) {
        var userPostcode = {};
        userPostcode.postcode_sector = sector;
        return UserPostcodes.addUserPostcode(userPostcode).catch(function(err) {
            res.status(500).json(err);
        }).then(function(data) {
            return data.insertId;
        });
    }).then(function(data) {
        return data[0].user_postcode_id;
    }).then(function(postcodeId) {
        // Get or create distances
        var distancePromises = [];
        for(var a = 0; a < zooIdList.length; a++) {
            distancePromises.push(getOrFindDistancePromise(postcodeId, zooIdList[a]));
        }
        Promise.all(distancePromises, function(values) {
            // Construct response object (Actually, values is exactly my list of objects right now?
            // Respond
            res.json(values);
        })
    });
});

module.exports = router;

var express = require('express');
var Zoos = require("../models/Zoos.js");
var Species = require("../models/Species.js");
var Promise = require("promise");
var router = express.Router();
var Postcode = require("postcode");
var UserPostcodes = require("../models/UserPostcodes.js");
var ZooDistances = require("../models/ZooDistances.js");
var Zoo = require("../models/Zoos.js");

function getDistanceOrNotPromise(postcodeId, zooId) {
    return ZooDistances.getZooDistanceByZooIdAndUserPostcodeId(zooId, postcodeId).then(function(data) {
        return data[0];
    }).catch(function(err) {
        return false;
    });
}

function promiseToGetDistancesFromGoogleMaps(userPostcodeSector, zooIdList) {
    var userPostcode = userPostcodeSector + "AA";
    var zooPostcodePromises = [];
    for (var a = 0; a < zooIdList; a++) {
        zooPostcodePromises.push(Zoo.getZooById(zooIdList[a]));
    }
    Promise.all(zooPostcodePromises).then(function (values) {
        var zooPostcodeList = [];
        for (var b = 0; b < values.length; b++) {
            zooPostcodeList.push(values[b].postcode);
        }
        var zooPostcodeString = zooPostcodeList.join("|");
        var googleApiKey = ""; // TODO: add before running
        var googleApiString = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=" + userPostcode + "&destinations=" + zooPostcodeString + "&key=" + googleApiKey;
        $.get(googleApiString, function (data) {
            var distanceResults = data.rows[0].elements;
            if (distanceResults.length !== zooIdList.length) {
                Promise.reject(new Error("Incorrect amount of distances returned from google maps API"));
            }
            var zooDistances = [];
            for (var c = 0; c < distanceResults.length; c++) {
                var zooDistance = {};
                zooDistance.user_postcode_id = "?"; //TODO
                zooDistance.zoo_id = zooIdList[c];
                zooDistance.metres = distanceResults[c].distance.value;
                zooDistances.push(zooDistance);
            }
            return zooDistances;
        })
    });
}

function promiseGetPostcodeId(postcodeSector) {
    return UserPostcodes.getUserPostcodeByPostcodeSector(postcodeSector).then(function(data) {
        if(data.length === 0) {
            var userPostcode = {};
            userPostcode.postcode_sector = postcodeSector;
            return UserPostcodes.addUserPostcode(userPostcode).then(function (data) {
                return data.insertId;
            });
        }
        return data[0].user_postcode_id;
    });
}

/* GET zoo distances. */
router.get('/:postcode/:zooIdList', function(req, res, next) {
    var postcode = new Postcode(req.params.postcode);
    // Validate postcode
    if(!postcode.valid()) {
        res.status(500).send("Invalid postcode");
        return;
    }
    // Get postcode sector
    var sector = postcode.sector();
    // Split up zoo id list
    var zooIdList = req.params.zooIdList.split(",");
    // Check for (or create) postcode id
    promiseGetPostcodeId(sector).then(function(postcodeId) {
        res.send("Got postcode id: "+postcodeId);
    }).catch(function(err) {
        console.log(err);
        res.status(500).send("Could not get postcode ID.");
    });
    return;
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
            distancePromises.push(getDistanceOrNotPromise(postcodeId, zooIdList[a]));
        }
        // Try and get distances from database
        Promise.all(distancePromises, function(values) {
            // Get the list of zoo IDs which failed
            var failedIds = [];
            for(var b = 0; b < zooIdList.length; b++) {
                if(values[b] === false) {
                    failedIds.push(zooIdList[b]);
                }
            }
            // If no IDs failed, just respond
            if(failedIds.length === 0) {
                res.json(values);
            }
            // Construct the request to google maps API
            promiseToGetDistancesFromGoogleMaps(sector, failedIds).catch(function(err) {
                res.status(500).send("Failed to use google API");
            }).then(function(data) {
                // Save google api responses to database
                // add api responses to overall response
                // Respond
                res.json(values);

            });
        })
    });
});

module.exports = router;

var express = require('express');
var Zoos = require("../models/Zoos.js");
var Species = require("../models/Species.js");
var Promise = require("promise");
var router = express.Router();
var Postcode = require("postcode");
var UserPostcodes = require("../models/UserPostcodes.js");
var ZooDistances = require("../models/ZooDistances.js");
var RequestPromise = require("request-promise");

function promiseGetPostcodeData(postcodeSector) {
    return UserPostcodes.getUserPostcodeByPostcodeSector(postcodeSector).then(function(data) {
        if(data.length === 0) {
            var userPostcode = {};
            userPostcode.postcode_sector = postcodeSector;
            return UserPostcodes.addUserPostcode(userPostcode).then(function (data) {
                var newRow = {};
                newRow.user_postcode_id = data.insertId;
                newRow.postcode_sector = postcodeSector;
                return newRow;
            });
        }
        return data[0];
    });
}

function promiseGetCachedDistanceOrNot(postcodeId, zooId) {
    return ZooDistances.getZooDistanceByZooIdAndUserPostcodeId(zooId, postcodeId).then(function(data) {
        if(data.length === 0) {
            return false;
        }
        return data[0];
    }).catch(function(err) {
        return false;
    });
}

function promiseGetZooData(zooId) {
    return Zoos.getZooById(zooId).then(function(data) {
        return data[0];
    });
}

function promiseToGetDistancesFromGoogleMaps(userPostcodeData, zooDataList) {
    var userPostcode = userPostcodeData.postcode_sector + "AA";
    var zooPostcodeList = [];
    for(var a = 0; a < zooDataList.length; a++) {
        zooPostcodeList.push(zooDataList[a].postcode);
    }
    var zooPostcodeStrings = [];
    var chunkSize = 25;
    for (var b=0; b < zooPostcodeList.length; b+=chunkSize) {
        zooPostcodeStrings.push(zooPostcodeList.slice(b,b+chunkSize).join("|"));
    }
    var googleApiKey = ""; // TODO: add before running
    var requestPromises = [];
    for (var c=0; c < zooPostcodeStrings.length; c++) {
        var googleApiString = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=" + userPostcode + "&destinations=" + zooPostcodeStrings[c] + "&key=" + googleApiKey;
        var requestOptions = {};
        requestOptions.uri = googleApiString;
        requestOptions.json = true;
        requestPromises.push(RequestPromise(requestOptions).then(function(data) {
            var distanceResults = data.rows[0].elements;
            if (distanceResults.length !== zooDataList.length) {
                Promise.reject(new Error("Incorrect amount of distances returned from google maps API"));
            }
            var rawDistances = [];
            for (var c = 0; c < distanceResults.length; c++) {
                rawDistances.push(distanceResults[c].distance.value);
            }
            return rawDistances;
        }));
    }
    return Promise.all(requestPromises).then(function(values) {
        var allDistances = [].concat.apply([],values);
        var zooDistances = [];
        for(var e = 0; e < allDistances.length; e++) {
            var zooDistance = {};
            zooDistance.user_postcode_id = userPostcodeData.user_postcode_id;
            zooDistance.zoo_id = zooDataList[e].zoo_id;
            zooDistance.metres = allDistances[e];
            zooDistances.push(zooDistance);
        }
        return zooDistances;
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
    var result = {};
    promiseGetPostcodeData(sector).catch(function(err) {
        console.log(err);
        res.status(500).send("Could not get postcode data.");
    }).then(function(postcodeData) {
        result.user_postcode = postcodeData;
        // Get or create distances
        var distancePromises = [];
        for (var a = 0; a < zooIdList.length; a++) {
            distancePromises.push(promiseGetCachedDistanceOrNot(postcodeData.user_postcode_id, zooIdList[a]));
        }
        // Try and get distances from database
        return Promise.all(distancePromises);
    }).then(function(storedDistances) {
        // Get promises for the addresses of failed zoos
        var promiseZooAddresses = [];
        for (var b = 0; b < zooIdList.length; b++) {
            if (storedDistances[b] === false) {
                promiseZooAddresses.push(promiseGetZooData(zooIdList[b]));
            }
        }
        return Promise.all(promiseZooAddresses);
    }).then(function(failedZooData) {
        // Construct the request to google maps API
        return promiseToGetDistancesFromGoogleMaps(result.user_postcode, failedZooData);
    }).then(function(newZooDistances) {
        console.log(newZooDistances);
        res.send("<br />New distances: "+newZooDistances);
        return; //TODO from here
        // Save google api responses to database
        // add api responses to overall response
        // Respond
        res.json(storedDistances);

    });
});

module.exports = router;

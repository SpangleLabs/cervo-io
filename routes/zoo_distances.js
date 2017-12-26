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
    for (var zooData of zooDataList) {
        zooPostcodeList.push(zooData.postcode);
    }
    var zooPostcodeStrings = [];
    var chunkSize = 25;
    for (var b=0; b < zooPostcodeList.length; b+=chunkSize) {
        zooPostcodeStrings.push(zooPostcodeList.slice(b,b+chunkSize).join(",UK|"));
    }
    var googleApiKey = "AIzaSyDDRJjxehwEZJq1f9XLJL_96tvPvvjzIvk"; //Location locked,fine to commit
    var requestPromises = [];
    for (var postcodeString of zooPostcodeStrings) {
        var googleApiString = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=" + userPostcode + ",UK&destinations=" + zooPostcodeString + ",UK&key=" + googleApiKey;
        var requestOptions = {};
        requestOptions.uri = googleApiString;
        requestOptions.json = true;
        requestPromises.push(RequestPromise(requestOptions).then(function(data) {
            var distanceResults = data.rows[0].elements;
            if (distanceResults.length !== zooDataList.length) {
                Promise.reject(new Error("Incorrect amount of distances returned from google maps API"));
            }
            var rawDistances = [];
            for (var distanceResult of distanceResults) {
                rawDistances.push(distanceResult.distance.value);
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
        res.status(404).send("Invalid postcode");
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
        for (var zooId of zooIdList) {
            distancePromises.push(promiseGetCachedDistanceOrNot(postcodeData.user_postcode_id, zooId));
        }
        // Try and get distances from database
        return Promise.all(distancePromises);
    }).then(function(storedDistances) {
        // Get promises for the addresses of failed zoos
        result.zoo_distances = storedDistances;
        var promiseZooAddresses = [];
        for (var b = 0; b < zooIdList.length; b++) {
            if (storedDistances[b] === false) {
                promiseZooAddresses.push(promiseGetZooData(zooIdList[b]));
            }
        }
        return Promise.all(promiseZooAddresses);
    }).then(function(failedZooData) {
        result.fail_zoo_data = failedZooData;
        // Optimise failed zoo data, remove duplicates
        var optimiseZooData = [];
        var optimiseZooIds = [];
        for (var failedZooDatum of failedZooData) {
            if(optimiseZooIds.indexOf(failedZooDatum.zoo_id) === -1) {
                optimiseZooData.push(failedZooDatum);
                optimiseZooIds.push(failedZooDatum.zoo_id);
            }
        }
        // Construct the request to google maps API
        return promiseToGetDistancesFromGoogleMaps(result.user_postcode, optimiseZooData);
    }).then(function(newZooDistances) {
        result.new_distances = newZooDistances;
        // Save google api responses to database
        var savePromises = [];
        for (var newZooDistance of newZooDistances) {
            savePromises.push(ZooDistances.addZooDistance(newZooDistance));
        }
        return Promise.all(savePromises);
    }).then(function(data) {
        var newDataDict = {};
        for (var f = 0; f < result.new_distances.length; f++) {
            result.new_distances[f].zoo_distance_id = data[f].insertId;
            newDataDict[result.new_distances[f].zoo_id] = result.new_distances[f];
        }
        // add api responses to overall response
        var failCount = 0;
        for(var d = 0; d < result.zoo_distances.length; d++) {
            if(result.zoo_distances[d] === false) {
                var zooId = result.fail_zoo_data[failCount].zoo_id;
                result.zoo_distances[d] = newDataDict[zooId];
                failCount++;
            }
        }
        // Respond
        res.json(result.zoo_distances);
    }).catch(function(err) {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;

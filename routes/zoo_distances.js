const express = require('express');
const Zoos = require("../models/Zoos.js");
const router = express.Router();
const Postcode = require("postcode");
const UserPostcodes = require("../models/UserPostcodes.js");
const ZooDistances = require("../models/ZooDistances.js");
const RequestPromise = require("request-promise");
const config = require("../config.js");

function promiseGetPostcodeData(postcodeSector) {
    return UserPostcodes.getUserPostcodeByPostcodeSector(postcodeSector).then(function (data) {
        if (data.length === 0) {
            const userPostcode = {};
            userPostcode.postcode_sector = postcodeSector;
            return UserPostcodes.addUserPostcode(userPostcode).then(function (data) {
                const newRow = {};
                newRow.user_postcode_id = data.insertId;
                newRow.postcode_sector = postcodeSector;
                return newRow;
            });
        }
        return data[0];
    });
}

function promiseGetCachedDistanceOrNot(postcodeId, zooId) {
    return ZooDistances.getZooDistanceByZooIdAndUserPostcodeId(zooId, postcodeId).then(function (data) {
        if (data.length === 0) {
            return false;
        }
        return data[0];
    }).catch(function (err) {
        return false;
    });
}

function promiseGetZooData(zooId) {
    return Zoos.getZooById(zooId).then(function (data) {
        return data[0];
    });
}

function promiseToGetDistancesFromGoogleMaps(userPostcodeData, zooDataList) {
    const userPostcode = userPostcodeData.postcode_sector + "AA";
    const zooPostcodeList = [];
    for (let zooData of zooDataList) {
        zooPostcodeList.push(zooData.postcode);
    }
    const zooPostcodeStrings = [];
    const chunkSize = 25;
    for (let b = 0; b < zooPostcodeList.length; b += chunkSize) {
        zooPostcodeStrings.push(zooPostcodeList.slice(b, b + chunkSize).join(",UK|"));
    }
    const googleApiKey = config["google_distance_api_key"]; //Location locked,fine to commit
    const requestPromises = [];
    for (let zooPostcodeString of zooPostcodeStrings) {
        const googleApiString = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=" + userPostcode + ",UK&destinations=" + zooPostcodeString + ",UK&key=" + googleApiKey;
        const requestOptions = {};
        requestOptions.uri = googleApiString;
        requestOptions.json = true;
        requestPromises.push(RequestPromise(requestOptions).then(function (data) {
            if(data.status !== "OK") {
                throw new Error("Distance metrics API failed, response: " + JSON.stringify(data));
            }
            const distanceResults = data.rows[0].elements;
            if (distanceResults.length !== zooDataList.length) {
                Promise.reject(new Error("Incorrect amount of distances returned from google maps API"));
            }
            const rawDistances = [];
            for (let distanceResult of distanceResults) {
                rawDistances.push(distanceResult.distance.value);
            }
            return rawDistances;
        }));
    }
    return Promise.all(requestPromises).then(function (values) {
        const allDistances = [].concat.apply([], values);
        const zooDistances = [];
        for (let e = 0; e < allDistances.length; e++) {
            const zooDistance = {};
            zooDistance.user_postcode_id = userPostcodeData.user_postcode_id;
            zooDistance.zoo_id = zooDataList[e].zoo_id;
            zooDistance.metres = allDistances[e];
            zooDistances.push(zooDistance);
        }
        return zooDistances;
    });
}

/* GET zoo distances. */
router.get('/:postcode/:zooIdList', function (req, res, next) {
    const postcode = new Postcode(req.params.postcode);
    // Validate postcode
    if (!postcode.valid()) {
        res.status(404).json({"error": "Invalid postcode"});
        return;
    }
    // Get postcode sector
    const sector = postcode.sector();
    // Split up zoo id list
    const zooIdList = req.params.zooIdList.split(",");
    // Check for (or create) postcode id
    const result = {};
    promiseGetPostcodeData(sector).catch(function (err) {
        console.log(err);
        res.status(500).send("Could not get postcode data.");
    }).then(function (postcodeData) {
        result.user_postcode = postcodeData;
        // Get or create distances
        const distancePromises = [];
        for (let zooId of zooIdList) {
            distancePromises.push(promiseGetCachedDistanceOrNot(postcodeData.user_postcode_id, zooId));
        }
        // Try and get distances from database
        return Promise.all(distancePromises);
    }).then(function (storedDistances) {
        // Get promises for the addresses of failed zoos
        result.zoo_distances = storedDistances;
        const promiseZooAddresses = [];
        for (let b = 0; b < zooIdList.length; b++) {
            if (storedDistances[b] === false) {
                promiseZooAddresses.push(promiseGetZooData(zooIdList[b]));
            }
        }
        return Promise.all(promiseZooAddresses);
    }).then(function (failedZooData) {
        result.fail_zoo_data = failedZooData;
        // Optimise failed zoo data, remove duplicates
        const optimiseZooData = [];
        const optimiseZooIds = [];
        for (let failedZooDatum of failedZooData) {
            if (optimiseZooIds.indexOf(failedZooDatum.zoo_id) === -1) {
                optimiseZooData.push(failedZooDatum);
                optimiseZooIds.push(failedZooDatum.zoo_id);
            }
        }
        // Construct the request to google maps API
        return promiseToGetDistancesFromGoogleMaps(result.user_postcode, optimiseZooData);
    }).then(function (newZooDistances) {
        result.new_distances = newZooDistances;
        // Save google api responses to database
        const savePromises = [];
        for (let newZooDistance of newZooDistances) {
            savePromises.push(ZooDistances.addZooDistance(newZooDistance));
        }
        return Promise.all(savePromises);
    }).then(function (data) {
        const newDataDict = {};
        for (let f = 0; f < result.new_distances.length; f++) {
            result.new_distances[f].zoo_distance_id = data[f].insertId;
            newDataDict[result.new_distances[f].zoo_id] = result.new_distances[f];
        }
        // add api responses to overall response
        let failCount = 0;
        for (let d = 0; d < result.zoo_distances.length; d++) {
            if (result.zoo_distances[d] === false) {
                const zooId = result.fail_zoo_data[failCount].zoo_id;
                result.zoo_distances[d] = newDataDict[zooId];
                failCount++;
            }
        }
        // Respond
        res.json(result.zoo_distances);
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({"error": "Failure to determine distances.", "more_detail": err.toLocaleString()});
    });
});

module.exports = router;

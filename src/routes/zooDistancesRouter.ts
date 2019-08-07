import {Router} from "express";
import {addUserPostcode, getUserPostcodeByPostcodeSector} from "../models/userPostcode";
import {addZooDistance, getZooDistanceByZooIdAndUserPostcodeId} from "../models/zooDistances";
import {getZooById} from "../models/zoos";
import * as Postcode from "postcode";

const RequestPromise = require("request-promise");
const config = require("../config.js");

export const ZooDistancesRouter = Router();

function promiseGetOrCreatePostcodeData(postcodeSector: string): Promise<UserPostcodeJson> {
    return getUserPostcodeByPostcodeSector(postcodeSector).then(function (data) {
        if (data.length === 0) {
            const userPostcode: NewUserPostcodeJson = {
                postcode_sector: postcodeSector
            };
            return addUserPostcode(userPostcode).then(function (data) {
                const newRow: UserPostcodeJson = {
                    user_postcode_id: data.insertId,
                    postcode_sector: postcodeSector
                };
                return newRow;
            });
        }
        return data[0];
    });
}

function promiseGetCachedDistanceOrNot(postcodeId: number, zooId: number): Promise<ZooDistanceJson | boolean> {
    return getZooDistanceByZooIdAndUserPostcodeId(zooId, postcodeId).then(function (data) {
        if (data.length !== 0) {
            return data[0];
        }
        return false;
    }).catch(function () {
        return false;
    });
}

function promiseGetZooData(zooId: number): Promise<ZooJson> {
    return getZooById(zooId).then(function (data) {
        return data[0];
    });
}

function promiseToGetDistancesFromGoogleMaps(userPostcodeData: UserPostcodeJson, zooDataList: ZooJson[]): Promise<NewZooDistanceJson[]> {
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

function promiseCreateZooDistances(userPostcodeData: UserPostcodeJson, zooIdList: number[]): Promise<ZooDistanceJson[]> {
    const result = promiseGetZooData(zooId).then(function (zooData) {
        promiseToGetDistancesFromGoogleMaps(userPostcodeData, optimiseZooData);
    });
    return result;
}

function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

function promiseGetOrCreateZooDistances(userPostcodeData: UserPostcodeJson, zooIdList: number[]): Promise<ZooDistanceJson[]> {
    const getCachedPromises = zooIdList.map(x => promiseGetCachedDistanceOrNot(userPostcodeData.user_postcode_id, x));
    Promise.all(getCachedPromises).then(function (resultList) {
        const missingDistances: number[] = resultList.map((result, index) => {
            if (result === false || result === true) {
                return zooIdList[index];
            } else {
                return null;
            }
        }).filter(notEmpty);
        const newDistances = promiseCreateZooDistances(userPostcodeData, missingDistances);
    });
    //TODO: remove after this
    return promiseGetCachedDistanceOrNot(userPostcodeData.user_postcode_id, zooId).then(function (data) {
        if(data === false || data === true) {
            return promiseCreateZooDistance(userPostcodeData, zooId);
        } else {
            return data;
        }
    });
}

/* GET zoo distances. */
ZooDistancesRouter.get('/:postcode/:zooIdList', function (req, res, next) {
    // Get parameters
    const paramPostcode: string = req.params.postcode;
    const paramZooIdList: string = req.params.zooIdList;
    // Parse postcode
    const postcode = new Postcode(paramPostcode);
    // Validate postcode
    if (!postcode.valid()) {
        res.status(404).json({"error": "Invalid postcode"});
        return;
    }
    // Get postcode sector
    const sector = postcode.sector();
    // Split up zoo id list
    const zooIdList: number[] = paramZooIdList.split(",").map(x => parseInt(x));
    const uniqueZooIdList: number[] = [...new Set(zooIdList)];
    // Check for (or create) postcode id
    promiseGetOrCreatePostcodeData(sector).then(function (postcodeData) {
        const uniqueDistancePromises: Promise<ZooDistanceJson>[] = uniqueZooIdList.map(x => promiseGetOrCreateZooDistance(postcodeData, x));
        return Promise.all(uniqueDistancePromises);
    }).then(function (zooDistances) {
        const uniqueDistanceMap: Map<number, ZooDistanceJson> = new Map(
            zooDistances.map(x => [x.zoo_id, x])
        );
        const results = zooIdList.map(x => uniqueDistanceMap.get(x));
        res.json(results);
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({"error": "Failure to determine distances.", "more_detail": err.toLocaleString()});
    });

    // TODO: from here down is old garbage
    let userPostcodeData: UserPostcodeJson;
    let resultZooDistances: (boolean | ZooDistanceJson)[];
    let resultFailZooData: ZooJson[];
    let resultNewDistances: NewZooDistanceJson[];
    Promise.all([]).then(function (data) {
        userPostcodeData = postcodeData;
        // Get or create distances
        const distancePromises = zooIdList.map(x => promiseGetCachedDistanceOrNot(postcodeData.user_postcode_id, x));
        // Try and get distances from database
        return Promise.all(distancePromises);
    }).then(function (storedDistances) {
        // Get promises for the addresses of failed zoos
        resultZooDistances = storedDistances;
        const promiseZooAddresses = [];
        for (let b = 0; b < zooIdList.length; b++) {
            if (storedDistances[b] === false) {
                promiseZooAddresses.push(promiseGetZooData(zooIdList[b]));
            }
        }
        return Promise.all(promiseZooAddresses);
    }).then(function (failedZooData) {
        resultFailZooData = failedZooData;
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
        return promiseToGetDistancesFromGoogleMaps(userPostcodeData, optimiseZooData);
    }).then(function (newZooDistances) {
        resultNewDistances = newZooDistances;
        // Save google api responses to database
        const savePromises = [];
        for (let newZooDistance of newZooDistances) {
            savePromises.push(addZooDistance(newZooDistance));
        }
        return Promise.all(savePromises);
    }).then(function (data) {
        const newDataDict = {};
        for (let f = 0; f < resultNewDistances.length; f++) {
            resultNewDistances[f].zoo_distance_id = data[f].insertId;
            newDataDict[resultNewDistances[f].zoo_id] = resultNewDistances[f];
        }
        // add api responses to overall response
        let failCount = 0;
        for (let d = 0; d < resultZooDistances.length; d++) {
            if (resultZooDistances[d] === false) {
                const zooId = resultFailZooData[failCount].zoo_id;
                resultZooDistances[d] = newDataDict[zooId];
                failCount++;
            }
        }
        // Respond
        res.json(resultZooDistances);
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({"error": "Failure to determine distances.", "more_detail": err.toLocaleString()});
    });
});


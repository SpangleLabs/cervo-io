import {Router} from "express";
import {addUserPostcode, getUserPostcodeByPostcodeSector} from "../models/userPostcode";
import {addZooDistance, getZooDistanceByZooIdAndUserPostcodeId} from "../models/zooDistances";
import {getZooById} from "../models/zoos";
import {config} from "../config";
import Postcode from "postcode";
import fetch from "node-fetch";

export const ZooDistancesRouter = Router();

function getOrCreatePostcode(postcodeSector: string): Promise<UserPostcodeJson> {
    return getUserPostcodeByPostcodeSector(postcodeSector).then(function (data) {
        if (data.length === 0) {
            const userPostcode: NewUserPostcodeJson = {
                postcode_sector: postcodeSector
            };
            return addUserPostcode(userPostcode);
        }
        return data[0];
    });
}

function getCachedDistanceOrNot(postcodeId: number, zooId: number): Promise<ZooDistanceJson | boolean> {
    return getZooDistanceByZooIdAndUserPostcodeId(zooId, postcodeId).then(function (data) {
        if (data.length !== 0) {
            return data[0];
        }
        return false;
    }).catch(function () {
        return false;
    });
}

function getZooData(zooId: number): Promise<ZooJson> {
    return getZooById(zooId).then(function (data) {
        return data[0];
    });
}

function queryGoogleDistancesToAddresses(start: string, destinationList: string[]): Promise<number[]> {
    // Chunk the addresses into strings of 25 at a time
    const chunkedDestinations: string[] = [];
    const chunkSize = 25;
    for (let b = 0; b < destinationList.length; b += chunkSize) {
        chunkedDestinations.push(destinationList.slice(b, b + chunkSize).join("|"));
    }
    // Make all the API requests
    const googleApiKey = config.google_distance_api_key; //Location locked,fine to commit
    const requestPromises: Promise<number[]>[] = [];
    for (let zooPostcodeString of chunkedDestinations) {
        const googleApiString = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=" + start + "&destinations=" + zooPostcodeString + "&key=" + googleApiKey;
        requestPromises.push(fetch(googleApiString).then(function (response) {
            return response.json();
        }).then(function (data) {
            if(data.status !== "OK") {
                throw new Error("Distance metrics API failed, response: " + JSON.stringify(data));
            }
            const distanceResults: {distance: {value: number}}[] = data.rows[0].elements;
            if (distanceResults.length !== destinationList.length) {
                throw new Error("Incorrect amount of distances returned from google maps API");
            }
            return distanceResults.map(x => x.distance.value);
        }));
    }
    // Flatten list
    return Promise.all(requestPromises).then(function(values: number[][]) {
        let results: number[] = [];
        values.forEach(x => results = results.concat(x));
        return results;
    });
}

function queryGoogleForZooDistances(userPostcodeData: UserPostcodeJson, zooDataList: ZooJson[]): Promise<NewZooDistanceJson[]> {
    // Organise postcodes
    const userPostcode = userPostcodeData.postcode_sector + "AA";
    const zooPostcodeList: string[] = zooDataList.map(x => x.postcode);
    // Chunk the postcodes into strings of 25 at a time, with nation selector
    const userAddress = userPostcode + ",UK";
    const destinationAddresses = zooPostcodeList.map(x => x + ",UK");
    return queryGoogleDistancesToAddresses(userAddress, destinationAddresses).then(function (allDistances) {
        const zooDistances: NewZooDistanceJson[] = allDistances.map(function (distance: number, index: number) {
            return {
                user_postcode_id: userPostcodeData.user_postcode_id,
                zoo_id: zooDataList[index].zoo_id,
                metres: distance
            }
        });
        return zooDistances;
    });
}

function createZooDistances(userPostcodeData: UserPostcodeJson, zooIdList: number[]): Promise<ZooDistanceJson[]> {
    if (zooIdList.length === 0) {
        return Promise.all([]);
    }
    const zooDataPromises = zooIdList.map(x => getZooData(x));
    return Promise.all(zooDataPromises).then(function (zooDataList) {
        return queryGoogleForZooDistances(userPostcodeData, zooDataList);
    }).then(function (newZooDistances) {
        // Save google api responses to database
        const savePromises: Promise<ZooDistanceJson>[] = newZooDistances.map(addZooDistance);
        return Promise.all(savePromises);
    });
}

function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}
function isBool<T>(value: T | boolean): value is boolean {
    return value === true || value === false;
}
function notBool<T>(value: T | boolean): value is T {
    return value !== false && value !== true;
}

function getOrCreateZooDistances(userPostcodeData: UserPostcodeJson, zooIdList: number[]): Promise<ZooDistanceJson[]> {
    const getCachedPromises = zooIdList.map(x => getCachedDistanceOrNot(userPostcodeData.user_postcode_id, x));
    return Promise.all(getCachedPromises).then(function (resultList) {
        const missingDistances: number[] = resultList.map((result, index) => {
            if (isBool(result)) {
                return zooIdList[index];
            } else {
                return null;
            }
        }).filter(notEmpty);
        const cachedDistances = new Map(
            resultList.filter(notBool).map(x => [x.zoo_id, x])
        )
        return createZooDistances(userPostcodeData, missingDistances).then(function(distances) {
            const newDistances = new Map(
                distances.map(x => [x.zoo_id, x])
            );
            const allDistances = new Map([...cachedDistances, ...newDistances]);
            return zooIdList.map(x => allDistances.get(x)).filter(notEmpty);
        });
    });
}

/* GET zoo distances. */
ZooDistancesRouter.get('/:postcode/:zooIdList', function (req, res, next) {
    // Get parameters
    const paramPostcode: string = req.params.postcode;
    const paramZooIdList: string = req.params.zooIdList;
    // Parse postcode
    const postcode = Postcode.parse(paramPostcode);
    // Validate postcode
    if (!postcode.valid) {
        res.status(404).json({"error": "Invalid postcode"});
        return;
    }
    // Get postcode sector
    const sector = postcode.sector;
    // Split up zoo id list
    const zooIdList: number[] = paramZooIdList.split(",").map(x => parseInt(x));
    const uniqueZooIdList: number[] = [...new Set(zooIdList)];
    // Check for (or create) postcode id
    getOrCreatePostcode(sector).then(function (postcodeData) {
        return getOrCreateZooDistances(postcodeData, uniqueZooIdList);
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
});

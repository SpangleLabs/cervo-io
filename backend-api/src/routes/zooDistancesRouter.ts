import {config} from "../config"
import Postcode from "postcode"
import fetch from "node-fetch"
import {AbstractRouter} from "./abstractRouter"
import {UserPostcodesProvider} from "../models/userPostcodesProvider"
import {ZooDistancesProvider} from "../models/zooDistancesProvider"
import {ZoosProvider} from "../models/zoosProvider"
import {AuthChecker} from "../authChecker"
import {
    NewUserPostcodeJson,
    NewZooDistanceJson,
    UserPostcodeJson,
    ZooDistanceJson,
    ZooJson
} from "@cervoio/common-lib/src/apiInterfaces"

export class ZooDistancesRouter extends AbstractRouter {
    zooDistances: ZooDistancesProvider
    userPostcodes: UserPostcodesProvider
    zoos: ZoosProvider

    constructor(authChecker: AuthChecker, zooDistancesProvider: ZooDistancesProvider, userPostcodesProvider: UserPostcodesProvider, zoosProvider: ZoosProvider) {
        super("/zoo_distances", authChecker)
        this.zooDistances = zooDistancesProvider
        this.userPostcodes = userPostcodesProvider
        this.zoos = zoosProvider
    }

    initialise(): void {
        const self = this;

        /* GET zoo distances. */
        this.router.get('/:postcode/:zooIdList', async function (req, res, next) {
            // Get parameters
            const paramPostcode: string = req.params.postcode;
            const paramZooIdList: string = req.params.zooIdList;
            // Parse postcode
            const postcode = Postcode.parse(paramPostcode);
            // Validate postcode
            if (!postcode.valid) {
                res.status(404).json({"error": "Invalid postcode."});
                return;
            }
            // Get postcode sector
            const sector = postcode.sector;
            // Split up zoo id list
            const zooIdList: number[] = paramZooIdList.split(",").map(x => parseInt(x));
            const uniqueZooIdList: number[] = [...new Set(zooIdList)];
            // Check for (or create) postcode id
            try {
                const postcodeData = await self.getOrCreatePostcode(sector)
                const zooDistances = await self.getOrCreateZooDistances(postcodeData, uniqueZooIdList)
                const uniqueDistanceMap: Map<number, ZooDistanceJson> = new Map(
                    zooDistances.map(x => [x.zoo_id, x])
                );
                const results = zooIdList.map(x => uniqueDistanceMap.get(x));
                res.json(results);
            } catch (err) {
                console.log(err);
                res.status(500).json({"error": "Failure to determine distances.", "more_detail": err.toLocaleString()});
            }
        })
    }

    async getOrCreatePostcode(postcodeSector: string): Promise<UserPostcodeJson> {
        const self = this;
        const data = await this.userPostcodes.getUserPostcodeByPostcodeSector(postcodeSector)
        if (data.length === 0) {
            const userPostcode: NewUserPostcodeJson = {
                postcode_sector: postcodeSector
            };
            return self.userPostcodes.addUserPostcode(userPostcode);
        }
        return data[0];
    }

    async getCachedDistanceOrNot(postcodeId: number, zooId: number): Promise<ZooDistanceJson | boolean> {
        try {
            const data = await this.zooDistances.getZooDistanceByZooIdAndUserPostcodeId(zooId, postcodeId)
            if (data.length !== 0) {
                return data[0]
            }
            return false
        } catch (err) {
            return false
        }
    }

    async getZooData(zooId: number): Promise<ZooJson> {
        const data = await this.zoos.getZooById(zooId)
        return data[0]
    }

    async fetchGoogleResponse(url: string): Promise<{status: string, rows: {elements: {distance: {value: number}}[]}[]}> {
        return (await fetch(url)).json()
    }

    async queryGoogleDistancesToAddresses(start: string, destinationList: string[]): Promise<number[]> {
        // Chunk the addresses into strings of 25 at a time
        const chunkedDestinations: string[][] = []
        const chunkSize = 25
        for (let b = 0; b < destinationList.length; b += chunkSize) {
            chunkedDestinations.push(destinationList.slice(b, b + chunkSize))
        }
        // Make all the API requests
        const googleApiKey = config.google_distance_api_key //Location locked,fine to commit
        const requestPromises: Promise<number[]>[] = []
        for (let zooPostcodeListChunk of chunkedDestinations) {
            const zooPostcodeString = zooPostcodeListChunk.join("|")
            const googleApiString = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=" + start + "&destinations=" + zooPostcodeString + "&key=" + googleApiKey;
            requestPromises.push((async () => {
                const data = await this.fetchGoogleResponse(googleApiString)
                if(data.status !== "OK") {
                    throw new Error("Distance metrics API failed, response: " + JSON.stringify(data))
                }
                const distanceResults: {distance: {value: number}}[] = data.rows[0].elements
                if (distanceResults.length !== zooPostcodeListChunk.length) {
                    throw new Error("Incorrect amount of distances returned from google maps API")
                }
                return distanceResults.map(x => x.distance.value)
            })())
        }
        // Flatten list
        const values = await Promise.all(requestPromises)
        let results: number[] = []
        values.forEach(x => results = results.concat(x))
        return results
    }

    async queryGoogleForZooDistances(userPostcodeData: UserPostcodeJson, zooDataList: ZooJson[]): Promise<NewZooDistanceJson[]> {
        // Organise postcodes
        const userPostcode = userPostcodeData.postcode_sector + "AA";
        const zooPostcodeList: string[] = zooDataList.map(x => x.postcode);
        // Chunk the postcodes into strings of 25 at a time, with nation selector
        const userAddress = userPostcode + ",UK";
        const destinationAddresses = zooPostcodeList.map(x => x + ",UK");
        const allDistances = await this.queryGoogleDistancesToAddresses(userAddress, destinationAddresses)
        return allDistances.map(function (distance: number, index: number) {
            return {
                user_postcode_id: userPostcodeData.user_postcode_id,
                zoo_id: zooDataList[index].zoo_id,
                metres: distance
            }
        });
    }

    async createZooDistances(userPostcodeData: UserPostcodeJson, zooIdList: number[]): Promise<ZooDistanceJson[]> {
        if (zooIdList.length === 0) {
            return Promise.all([]);
        }
        const zooDataPromises = zooIdList.map(x => this.getZooData(x));
        const self = this;
        const zooDataList = await Promise.all(zooDataPromises)
        const newZooDistances = await self.queryGoogleForZooDistances(userPostcodeData, zooDataList)
        // Save google api responses to database
        const savePromises: Promise<ZooDistanceJson>[] = newZooDistances.map(x => self.zooDistances.addZooDistance(x));
        return await Promise.all(savePromises);
    }

    async getOrCreateZooDistances(userPostcodeData: UserPostcodeJson, zooIdList: number[]): Promise<ZooDistanceJson[]> {
        const getCachedPromises = zooIdList.map(x => this.getCachedDistanceOrNot(userPostcodeData.user_postcode_id, x));
        const self = this;
        const resultList = await Promise.all(getCachedPromises)
        const missingDistances: number[] = resultList.map((result, index) => {
            if (isBool(result)) {
                return zooIdList[index];
            } else {
                return null;
            }
        }).filter(notEmpty);
        const cachedDistances = new Map(
            resultList.filter(notBool).map(x => [x.zoo_id, x])
        );
        const distances = await self.createZooDistances(userPostcodeData, missingDistances)
        const newDistances = new Map(
            distances.map(x => [x.zoo_id, x])
        );
        const allDistances = new Map([...cachedDistances, ...newDistances]);
        return zooIdList.map(x => allDistances.get(x)).filter(notEmpty);
    }
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

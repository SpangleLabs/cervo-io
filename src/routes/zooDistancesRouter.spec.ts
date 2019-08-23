import * as chai from 'chai';
import chaiHttp = require('chai-http');
//import {expect} from "chai";

chai.use(chaiHttp);

describe("/zoo_distances/:postcode/:zooIdList/ endpoint", function() {
    it("should return 404 if given invalid postcode");
    it("should return an error if given an empty list of zoos");
    it("should return an error if given invalid zoo id list");
});

describe("getOrCreatePostcode()", function() {
    it("should retrieve an ID for an existing postcode sector");
    it("should create a new postcode sector entry if one does not exist");
});

describe("getCachedDistanceOrNot()", function () {
    it("should get a zoo distance from the database where available");
    it("should return false if zoo distance is not in the database");
});

describe("gteZooData()", function () {
    it("should get zoo data for a specified zoo");
    it("should raise error if zoo does not exist");
});

describe("queryGoogleDistancesToAddress()", function () {
    it("should split destination list into chunks");
    it("should handle failure from the distance matrix API");
    it("should parse distances from distance matrix API");
    it("should flatten distances into a single list");
});

describe("queryGoogleForZooDistances()", function () {
    it("should extend postcode sector to a postcode");
    it("should turn zoos into list of postcodes");
    it("should add UK to postcodes and zoos");
    it("should construct zoo distance json objects from the distances");
});

describe("createZooDistances()", function () {
    it("should return an empty list when no zoos are specified");
    it("should query google for distances");
    it("should save new distances to database");
});

describe("getOrCreateZooDistances()", function () {
    it("should get distances from cache");
    it("should create distances which are not in cache");
    it("should combine the lists of cached and new distances");
});
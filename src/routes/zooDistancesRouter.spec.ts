import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {ZooDistancesRouter} from "./zooDistancesRouter";
import {MockUserPostcodeProvider, MockZooDistanceProvider, MockZoosProvider} from "../testMocks";
import {expect} from "chai";
import {Number, Record, String} from "runtypes";

chai.use(chaiHttp);

const Zoo = Record({
    zoo_id: Number,
    name: String,
    link: String,
    postcode: String,
    latitude: Number,
    longitude: Number
});
const UserPostcode = Record({
    user_postcode_id: Number,
    postcode_sector: String
});

describe("/zoo_distances/:postcode/:zooIdList/ endpoint", function() {
    it("should return 404 if given invalid postcode");
    it("should return an error if given an empty list of zoos");
    it("should return an error if given invalid zoo id list");
    it("should handle duplicate zoo ids without making duplicate requests");
    it("should return specified zoo distances");
});

describe("getOrCreatePostcode()", function() {
    it("should retrieve an ID for an existing postcode sector", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([
            {user_postcode_id: 1, postcode_sector: "SA1 1"}
        ]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.getOrCreatePostcode("SA1 1").then(function(postcodeData) {
            UserPostcode.check(postcodeData);
            expect(postcodeData.user_postcode_id).to.be.equal(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should create a new postcode sector entry if one does not exist", function (done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.getOrCreatePostcode("SA1 1").then(function(postcodeData) {
            UserPostcode.check(postcodeData);
            expect(userPostcodesProvider.testUserPostcodes).to.be.length(1);
            expect(postcodeData.user_postcode_id).to.be.equal(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });
});

describe("getCachedDistanceOrNot()", function () {
    it("should get a zoo distance from the database where available");
    it("should return false if zoo distance is not in the database");
});

describe("getZooData()", function () {
    it("should get zoo data for a specified zoo", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([
            {zoo_id: 1, name: "Test zoo", link: "http://example.com", postcode: "SA1 1AA", latitude: 47.74, longitude: -59.65}
        ]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.getZooData(1).then(function (zooData) {
            expect(zooData).to.be.an("object");
            Zoo.check(zooData);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should return undefined if zoo does not exist", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.getZooData(1).then(function (zooData) {
            expect(zooData).to.be.undefined;
            done();
        }).catch(function(err) {
            done(err);
        });
    });
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
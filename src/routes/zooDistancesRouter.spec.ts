import * as chai from 'chai';
import {expect} from 'chai';
import {ZooDistancesRouter} from "./zooDistancesRouter";
import {MockUserPostcodeProvider, MockZooDistanceProvider, MockZoosProvider} from "../testMocks";
import {Number, Record, String} from "runtypes";
import chaiHttp = require('chai-http');

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
const ZooDistance = Record({
    zoo_id: Number,
    metres: Number,
    user_postcode_id: Number,
    zoo_distance_id: Number
});
const NewZooDistance = Record({
    zoo_id: Number,
    metres: Number,
    user_postcode_id: Number
})

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
    it("should get a zoo distance from the database where available", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([
            {zoo_distance_id: 1, user_postcode_id: 1, zoo_id: 3, metres: 789}
        ]);
        const userPostcodesProvider = new MockUserPostcodeProvider([
            {user_postcode_id: 1, postcode_sector: "SA1 1"}
        ]);
        const zoosProvider = new MockZoosProvider([
            {zoo_id: 3, name: "Zoo of tests", link: "http://example.com", postcode: "SA3 4AA", latitude: 87.23, longitude: 67.33}
        ]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.getCachedDistanceOrNot(1, 3).then(function(distance) {
            expect(distance).not.to.be.false;
            ZooDistance.check(distance);
            done();
        }).catch(function(err) {
            done(err);
        })
    });

    it("should return false if zoo distance is not in the database", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([
            {zoo_distance_id: 1, user_postcode_id: 1, zoo_id: 3, metres: 789}
        ]);
        const userPostcodesProvider = new MockUserPostcodeProvider([
            {user_postcode_id: 1, postcode_sector: "SA1 1"}
        ]);
        const zoosProvider = new MockZoosProvider([
            {zoo_id: 2, name: "Mystery park", link: "http://example.com/404.html", postcode: "NN14 1AA", latitude: 45.23, longitude: -14.57},
            {zoo_id: 3, name: "Zoo of tests", link: "http://example.com", postcode: "SA3 4AA", latitude: 87.23, longitude: 67.33}
        ]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.getCachedDistanceOrNot(1, 2).then(function(distance) {
            expect(distance).to.be.false;
            done();
        }).catch(function(err) {
            done(err);
        })
    });
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
    it("should split destination list into chunks", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.fetchGoogleResponse;
        let urls: string[] = [];
        zooDistanceRouter.fetchGoogleResponse = function (url: string) {
            urls.push(url);
            return Promise.resolve({
                status: "mock",
                rows: []
            });
        };
        const testDestination = "SA2 1AA,UK";
        const testDestRegex = new RegExp(testDestination, "g");
        const destinations = Array(30).fill(testDestination);

        zooDistanceRouter.queryGoogleDistancesToAddresses("SA1 1AA,UK", destinations).then(function() {
            done(new Error("Should have failed to get response"));
        }).catch(function () {
            expect(urls).to.be.length(2);
            expect(urls[0].match(testDestRegex) || []).to.be.length(25);
            expect(urls[1].match(testDestRegex) || []).to.be.length(5);
            done();
        }).then(function() {
            zooDistanceRouter.fetchGoogleResponse = oldFetch;
        });
    });

    it("should handle failure from the distance matrix API", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.fetchGoogleResponse;
        zooDistanceRouter.fetchGoogleResponse = function (url: string) {
            return Promise.resolve({
                status: "failure testing",
                rows: []
            });
        };

        zooDistanceRouter.queryGoogleDistancesToAddresses("SA1 1AA,UK", ["SA2 1AA,UK"]).then(function() {
            done(new Error("Should have failed to get distances."));
        }).catch(function (err) {
            expect(err).to.be.a("Error");
            expect(err.message).to.include("Distance metrics API failed, response:");
            expect(err.message).to.include("failure testing");
            done();
        }).then(function() {
            zooDistanceRouter.fetchGoogleResponse = oldFetch;
        });
    });

    it("should parse distances from distance matrix API", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.fetchGoogleResponse;
        zooDistanceRouter.fetchGoogleResponse = function (url: string) {
            return Promise.resolve({
                status: "OK",
                rows: [{elements: [{distance: {value: 567}}]}]
            });
        };

        zooDistanceRouter.queryGoogleDistancesToAddresses("SA1 1AA,UK", ["SA2 1AA,UK"]).then(function(distances) {
            expect(distances).to.be.an("array");
            expect(distances).to.be.length(1);
            expect(distances[0]).to.be.equal(567);
            done();
        }).catch(function (err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.fetchGoogleResponse = oldFetch;
        });
    });

    it("should flatten distances into a single list", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const testDestination = "SA2 1AA,UK";
        const testDestRegex = new RegExp(testDestination, "g");
        const oldFetch = zooDistanceRouter.fetchGoogleResponse;
        zooDistanceRouter.fetchGoogleResponse = function (url: string) {
            const count = (url.match(testDestRegex) || []).length;
            const distances = Array(count).fill({distance: {value: 567}});
            return Promise.resolve({
                status: "OK",
                rows: [{elements: distances}]
            });
        };

        zooDistanceRouter.queryGoogleDistancesToAddresses("SA1 1AA,UK", Array(30).fill(testDestination)).then(function(distances) {
            expect(distances).to.be.an("array");
            expect(distances).to.be.length(30);
            for(let distance of distances) {
                expect(distance).to.be.equal(567);
            }
            done();
        }).catch(function (err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.fetchGoogleResponse = oldFetch;
        });
    });
});

describe("queryGoogleForZooDistances()", function () {
    it("should extend postcode sector to a postcode", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.queryGoogleDistancesToAddresses;
        let valStart: string | null = null;
        zooDistanceRouter.queryGoogleDistancesToAddresses = function (start: string, destinationList: string[]) {
            valStart = start;
            return Promise.resolve([567]);
        };
        const userPostcodeData = {user_postcode_id: 1, postcode_sector: "SA2 1"};
        const zooDataList = [
            {zoo_id: 1, name: "Test zoo", link: "http://example.com", postcode: "CB1 4AA", latitude: -23.45, longitude: -120.67}
        ]

        zooDistanceRouter.queryGoogleForZooDistances(userPostcodeData, zooDataList).then(function(distances) {
            expect(valStart).not.to.be.null;
            expect(valStart).to.be.equal("SA2 1AA,UK");
            done();
        }).catch(function (err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.queryGoogleDistancesToAddresses = oldFetch;
        });
    });

    it("should turn zoos into list of postcodes with UK", function (done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.queryGoogleDistancesToAddresses;
        let valDestinationList: string[] | null = null;
        zooDistanceRouter.queryGoogleDistancesToAddresses = function (start: string, destinationList: string[]) {
            valDestinationList = destinationList;
            return Promise.resolve([567, 127]);
        };
        const userPostcodeData = {user_postcode_id: 1, postcode_sector: "SA2 1"};
        const zooDataList = [
            {zoo_id: 1, name: "Test zoo", link: "http://example.com", postcode: "CB1 4AA", latitude: -23.45, longitude: -120.67},
            {zoo_id: 2, name: "Another test", link: "http://example.com/2", postcode: "NN14 4AA", latitude: 62.23, longitude: -12.6}
        ]

        zooDistanceRouter.queryGoogleForZooDistances(userPostcodeData, zooDataList).then(function(distances) {
            expect(valDestinationList).not.to.be.null;
            expect(valDestinationList).to.be.length(2);
            expect(valDestinationList).to.contain("CB1 4AA,UK");
            expect(valDestinationList).to.contain("NN14 4AA,UK");
            done();
        }).catch(function (err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.queryGoogleDistancesToAddresses = oldFetch;
        });
    });

    it("should construct zoo distance json objects from the distances", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.queryGoogleDistancesToAddresses;
        zooDistanceRouter.queryGoogleDistancesToAddresses = function (start: string, destinationList: string[]) {
            return Promise.resolve([567, 123]);
        };
        const userPostcodeData = {user_postcode_id: 1, postcode_sector: "SA2 1"};
        const zooDataList = [
            {zoo_id: 1, name: "Test zoo", link: "http://example.com", postcode: "CB1 4AA", latitude: -23.45, longitude: -120.67},
            {zoo_id: 2, name: "Another test", link: "http://example.com/2", postcode: "NN14 4AA", latitude: 62.23, longitude: -12.6}
        ]

        zooDistanceRouter.queryGoogleForZooDistances(userPostcodeData, zooDataList).then(function(distances) {
            expect(distances).not.to.be.null;
            expect(distances).to.be.length(2);
            for(let distance of distances) {
                NewZooDistance.check(distance);
                expect(distance.user_postcode_id).to.be.equal(1);
                expect([1,2]).to.contain(distance.zoo_id);
                expect([567,123]).to.contain(distance.metres);
            }
            done();
        }).catch(function (err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.queryGoogleDistancesToAddresses = oldFetch;
        });
    });
});

describe("createZooDistances()", function () {
    it("should return an empty list when no zoos are specified", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        zooDistanceRouter.createZooDistances({user_postcode_id: 1, postcode_sector: "SA1 1"}, []).then(function (data) {
            expect(data).to.be.an("array");
            expect(data).to.be.length(0);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should query google for distances", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.queryGoogleForZooDistances;
        let called = false;
        zooDistanceRouter.queryGoogleForZooDistances = function (userPostcodeData: UserPostcodeJson, zooDataList: ZooJson[]) {
            called = true;
            return Promise.resolve([
                {user_postcode_id: 1, zoo_id: 1, metres: 163},
                {user_postcode_id: 1, zoo_id: 3, metres: 9371},
                {user_postcode_id: 1, zoo_id: 4, metres: 19267}
            ]);
        };

        zooDistanceRouter.createZooDistances({user_postcode_id: 1, postcode_sector: "SA1 1"}, [1, 3, 4]).then(function (data) {
            expect(called).to.be.true;
            expect(data).to.be.an("array");
            expect(data).to.be.length(3);
            for(let newDistance of data) {
                ZooDistance.check(newDistance);
            }
            done();
        }).catch(function(err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.queryGoogleForZooDistances = oldFetch;
        });
    });

    it("should save new distances to database", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.queryGoogleForZooDistances;
        zooDistanceRouter.queryGoogleForZooDistances = function (userPostcodeData: UserPostcodeJson, zooDataList: ZooJson[]) {
            return Promise.resolve([
                {user_postcode_id: 1, zoo_id: 1, metres: 163},
                {user_postcode_id: 1, zoo_id: 3, metres: 9371},
                {user_postcode_id: 1, zoo_id: 4, metres: 19267}
            ]);
        };

        zooDistanceRouter.createZooDistances({user_postcode_id: 1, postcode_sector: "SA1 1"}, [1, 3, 4]).then(function (data) {
            expect(zooDistancesProvider.testZooDistances).to.be.length(3);
            for(let newDistance of zooDistancesProvider.testZooDistances) {
                ZooDistance.check(newDistance);
                expect([163,9371,19267]).to.contain(newDistance.metres);
            }
            done();
        }).catch(function(err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.queryGoogleForZooDistances = oldFetch;
        });
    });
});

describe("getOrCreateZooDistances()", function () {
    it("should get distances from cache", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([
            {zoo_distance_id: 1, user_postcode_id: 1, zoo_id: 1, metres: 27293},
            {zoo_distance_id: 2, user_postcode_id: 1, zoo_id: 3, metres: 34029},
            {zoo_distance_id: 3, user_postcode_id: 1, zoo_id: 4, metres: 124}
        ]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.queryGoogleForZooDistances;
        zooDistanceRouter.queryGoogleForZooDistances = function (userPostcodeData: UserPostcodeJson, zooDataList: ZooJson[]) {
            return Promise.reject(new Error("should not be called"));
        };

        zooDistanceRouter.getOrCreateZooDistances({user_postcode_id: 1, postcode_sector: "SA1 1"}, [1,3,4]).then(function (data) {
            expect(data).to.be.an("array");
            for(let distance of data) {
                ZooDistance.check(distance);
            }
            done();
        }).catch(function(err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.queryGoogleForZooDistances = oldFetch;
        });
    });

    it("should create distances which are not in cache", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([
            {zoo_id: 4, name: "Test zoo", link: "http://example.com", postcode: "SA3 1AA", latitude: -67.34, longitude: -123.47}
        ]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.createZooDistances;
        let zoosToQuery: number[] | null = null;
        zooDistanceRouter.createZooDistances = function (userPostcodeData: UserPostcodeJson, zooIdList: number[]) {
            zoosToQuery = zooIdList;
            return Promise.resolve([
                {zoo_distance_id: 5, zoo_id: 4, user_postcode_id: 1, metres: 12345}
            ])
        };

        zooDistanceRouter.getOrCreateZooDistances({user_postcode_id: 1, postcode_sector: "SA1 1"}, [4]).then(function (data) {
            expect(zoosToQuery).not.to.be.null;
            expect(zoosToQuery).to.be.length(1);
            expect(zoosToQuery).to.contain(4);
            expect(data).to.be.an("array")
            expect(data).to.be.length(1);
            for(let distance of data) {
                ZooDistance.check(distance);
            }
            expect(data.map(x => x.metres)).to.contain(12345);
            done();
        }).catch(function(err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.createZooDistances = oldFetch;
        });
    });

    it("should combine the lists of cached and new distances", function(done) {
        const zooDistancesProvider = new MockZooDistanceProvider([
            {zoo_distance_id: 1, user_postcode_id: 1, zoo_id: 1, metres: 27293},
            {zoo_distance_id: 2, user_postcode_id: 1, zoo_id: 3, metres: 34029}
        ]);
        const userPostcodesProvider = new MockUserPostcodeProvider([]);
        const zoosProvider = new MockZoosProvider([
            {zoo_id: 4, name: "Test zoo", link: "http://example.com", postcode: "SA3 1AA", latitude: -67.34, longitude: -123.47}
        ]);
        const zooDistanceRouter = new ZooDistancesRouter(zooDistancesProvider, userPostcodesProvider, zoosProvider);

        const oldFetch = zooDistanceRouter.createZooDistances;
        zooDistanceRouter.createZooDistances = function (userPostcodeData: UserPostcodeJson, zooIdList: number[]) {
            return Promise.resolve([
                {zoo_distance_id: 5, zoo_id: 4, user_postcode_id: 1, metres: 12345}
            ])
        };

        zooDistanceRouter.getOrCreateZooDistances({user_postcode_id: 1, postcode_sector: "SA1 1"}, [1,3,4]).then(function (data) {
            expect(data).to.be.an("array");
            expect(data).to.be.length(3);
            for(let distance of data) {
                ZooDistance.check(distance);
                expect(distance.user_postcode_id).to.be.equal(1);
            }
            const distance1 = data.filter(x => x.zoo_id == 1);
            const distance2 = data.filter(x => x.zoo_id == 3);
            const distance3 = data.filter(x => x.zoo_id == 4);
            expect(distance1).to.be.length(1);
            expect(distance2).to.be.length(1);
            expect(distance3).to.be.length(1);
            expect(distance1[0].zoo_id).to.be.equal(1);
            expect(distance2[0].zoo_id).to.be.equal(3);
            expect(distance3[0].zoo_id).to.be.equal(4);
            expect(distance1[0].metres).to.be.equal(27293);
            expect(distance2[0].metres).to.be.equal(34029);
            expect(distance3[0].metres).to.be.equal(12345);
            done();
        }).catch(function(err) {
            done(err);
        }).then(function() {
            zooDistanceRouter.createZooDistances = oldFetch;
        });
    });
});
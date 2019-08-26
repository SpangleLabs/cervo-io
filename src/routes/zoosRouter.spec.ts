import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {
    MockAuthChecker,
    MockSpeciesProvider,
    MockZoosProvider,
    requestRouter
} from "../testMocks";
import {expect} from "chai";
import {ZoosRouter} from "./zoosRouter";
import {Number, String, Record, Array} from "runtypes";
import {NewZooJson} from "../apiInterfaces";

chai.use(chaiHttp);

const Zoo = Record({
    zoo_id: Number,
    name: String,
    link: String,
    postcode: String,
    latitude: Number,
    longitude: Number
});
const SpeciesEntryForZoo = Record({
    species_id: Number,
    category_id: Number,
    common_name: String,
    latin_name: String,
    zoo_id: Number,
    zoo_species_id: Number
});
const FullZoo = Record({
    zoo_id: Number,
    name: String,
    link: String,
    postcode: String,
    latitude: Number,
    longitude: Number,
    species: Array(SpeciesEntryForZoo)
});

describe("Zoos Router", function () {
    describe("All zoos listing endpoint", function () {
        it('should list all zoos', function (done) {
            const mockZoosProvider = new MockZoosProvider([
                {
                    zoo_id: 1,
                    name: "Zoo one",
                    link: "http://example.com/zoo_1",
                    postcode: "SA1 1AA",
                    latitude: 15.012,
                    longitude: -122.522
                },
                {
                    zoo_id: 2,
                    name: "Zoo two",
                    link: "http://example.com/zoo_2",
                    postcode: "CA1 1AA",
                    latitude: 74.232,
                    longitude: 83.245
                },
                {
                    zoo_id: 3,
                    name: "Zoo three",
                    link: "http://example.com/zoo_3",
                    postcode: "NN14 1AA",
                    latitude: -43.765,
                    longitude: 35.671
                }
            ]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            const zoosRouter = new ZoosRouter(authChecker, mockZoosProvider, mockSpeciesProvider);
            requestRouter(zoosRouter).get("/zoos/").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(3);
                for (let zoo of res.body) {
                    Zoo.check(zoo);
                }
                done();
            })
        });
    });

    describe("Specific zoo result endpoint", function () {
        it('should return a specific zoo', function (done) {
            const mockZoosProvider = new MockZoosProvider([
                {
                    zoo_id: 1,
                    name: "Zoo one",
                    link: "http://example.com/zoo_1",
                    postcode: "SA1 1AA",
                    latitude: 15.012,
                    longitude: -122.522
                },
                {
                    zoo_id: 2,
                    name: "Zoo two",
                    link: "http://example.com/zoo_2",
                    postcode: "CA1 1AA",
                    latitude: 74.232,
                    longitude: 83.245
                },
                {
                    zoo_id: 3,
                    name: "Zoo three",
                    link: "http://example.com/zoo_3",
                    postcode: "NN14 1AA",
                    latitude: -43.765,
                    longitude: 35.671
                }
            ]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            const zoosRouter = new ZoosRouter(authChecker, mockZoosProvider, mockSpeciesProvider);
            requestRouter(zoosRouter).get("/zoos/2").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(1);
                const zoo = res.body[0];
                FullZoo.check(zoo);
                done();
            })
        });

        it('should add matching species to specified zoo', function (done) {
            const mockZoosProvider = new MockZoosProvider([
                {
                    zoo_id: 1,
                    name: "Zoo one",
                    link: "http://example.com/zoo_1",
                    postcode: "SA1 1AA",
                    latitude: 15.012,
                    longitude: -122.522
                },
                {
                    zoo_id: 2,
                    name: "Zoo two",
                    link: "http://example.com/zoo_2",
                    postcode: "CA1 1AA",
                    latitude: 74.232,
                    longitude: 83.245
                },
                {
                    zoo_id: 3,
                    name: "Zoo three",
                    link: "http://example.com/zoo_3",
                    postcode: "NN14 1AA",
                    latitude: -43.765,
                    longitude: 35.671
                }
            ]);
            const mockSpeciesProvider = new MockSpeciesProvider(
                [
                    {species_id: 1, category_id: 1, common_name: "Bird", latin_name: "Avian", hidden: false},
                    {species_id: 2, category_id: 1, common_name: "Deer", latin_name: "Cervus", hidden: false},
                    {species_id: 3, category_id: 1, common_name: "Dog", latin_name: "Canine", hidden: false}
                ],
                [
                    {zoo_id: 2, species_id: 1, zoo_species_id: 1},
                    {zoo_id: 1, species_id: 2, zoo_species_id: 2},
                    {zoo_id: 2, species_id: 3, zoo_species_id: 3},
                    {zoo_id: 3, species_id: 1, zoo_species_id: 4}
                ]
            );
            const authChecker = new MockAuthChecker();
            const zoosRouter = new ZoosRouter(authChecker, mockZoosProvider, mockSpeciesProvider);
            requestRouter(zoosRouter).get("/zoos/2").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(1);
                const zoo = res.body[0];
                FullZoo.check(zoo);
                expect(zoo.species.length).to.be.equal(2);
                for (let zooSpecies of zoo.species) {
                    SpeciesEntryForZoo.check(zooSpecies);
                    expect(zooSpecies.zoo_id).to.be.equal(2);
                }
                done();
            })
        });
    });

    describe("POST / endpoint", function() {
        it("should create a new zoo if authorized as admin", function(done) {

            const mockZoosProvider = new MockZoosProvider([
                {zoo_id: 1, name: "Test zoo", link: "http://example.com", postcode: "SA1 1AA", latitude: 57.3, longitude: -124.6}
            ]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            const zoosRouter = new ZoosRouter(authChecker, mockZoosProvider, mockSpeciesProvider);

            const newZoo: NewZooJson = {
                name: "Another zoo",
                link: "http://example.com/blah",
                postcode: "SA3 1AA",
                longitude: 73.22,
                latitude: -12.3
            };

            requestRouter(zoosRouter)
                .post("/zoos/")
                .set("content-type", "application/json")
                .send(newZoo)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.type).to.be.equal("application/json");
                    const zoo = res.body;
                    Zoo.check(zoo);
                    expect(mockZoosProvider.testZoos).to.be.length(2);
                    expect(mockZoosProvider.testZoos.filter(x => x.name == "Another zoo")).to.be.length(1);
                    done();
                })
        });

        it("should not create a zoo if not an admin", function(done) {
            const mockZoosProvider = new MockZoosProvider([]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const zoosRouter = new ZoosRouter(authChecker, mockZoosProvider, mockSpeciesProvider);

            const newZoo: NewZooJson = {
                name: "Another zoo",
                link: "http://example.com/blah",
                postcode: "SA3 1AA",
                longitude: 73.22,
                latitude: -12.3
            };

            requestRouter(zoosRouter)
                .post("/zoos/")
                .set("content-type", "application/json")
                .send(newZoo)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(mockZoosProvider.testZoos).to.be.length(0);
                    done();
                });
        });

        it("should not create a zoo if not logged in", function(done) {
            const mockZoosProvider = new MockZoosProvider([]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const zoosRouter = new ZoosRouter(authChecker, mockZoosProvider, mockSpeciesProvider);

            const newZoo: NewZooJson = {
                name: "Another zoo",
                link: "http://example.com/blah",
                postcode: "SA3 1AA",
                longitude: 73.22,
                latitude: -12.3
            };

            requestRouter(zoosRouter)
                .post("/zoos/")
                .set("content-type", "application/json")
                .send(newZoo)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(mockZoosProvider.testZoos).to.be.length(0);
                    done();
                });
        });
    });
});

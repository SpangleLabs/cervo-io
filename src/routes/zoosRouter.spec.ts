import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {MockSpeciesProvider, MockZoosProvider, requestRouter} from "../testMocks";
import {expect} from "chai";
import {ZoosRouter} from "./zoosRouter";
import {Number, String, Record, Array} from "runtypes";

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
            const zoosRouter = new ZoosRouter(mockZoosProvider, mockSpeciesProvider);
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
            const zoosRouter = new ZoosRouter(mockZoosProvider, mockSpeciesProvider);
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
                    {species_id: 1, category_id: 1, common_name: "Bird", latin_name: "Avian"},
                    {species_id: 2, category_id: 1, common_name: "Deer", latin_name: "Cervus"},
                    {species_id: 3, category_id: 1, common_name: "Dog", latin_name: "Canine"}
                ],
                [
                    {zoo_id: 2, species_id: 1, zoo_species_id: 1},
                    {zoo_id: 1, species_id: 2, zoo_species_id: 2},
                    {zoo_id: 2, species_id: 3, zoo_species_id: 3},
                    {zoo_id: 3, species_id: 1, zoo_species_id: 4}
                ]
            );
            const zoosRouter = new ZoosRouter(mockZoosProvider, mockSpeciesProvider);
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
});

import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {MockAuthChecker, MockSpeciesProvider, MockZoosProvider, requestRouter} from "../testMocks";
import {expect} from "chai";
import {SpeciesRouter} from "./speciesRouter";
import {Record, Number, String} from "runtypes";

chai.use(chaiHttp);

const Species = Record({
    species_id: Number,
    common_name: String,
    latin_name: String,
    category_id: Number
})

describe("Species router", function() {

    describe("GET /valid_first_letters endpoint", function() {
        it("Returns a list of letters", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/valid_first_letters")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    expect(res.body).to.contain("c");
                    expect(res.body).to.contain("r");
                    done();
                });
        });

        it("Doesn't include letters of hidden species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/valid_first_letters")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(1);
                    expect(res.body).not.to.contain("c");
                    expect(res.body).to.contain("r");
                    done();
                });
        });

        it("Includes letters which hidden and unhidden species use", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: true},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/valid_first_letters")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    expect(res.body).not.to.contain("d");
                    expect(res.body).to.contain("c");
                    expect(res.body).to.contain("r");
                    done();
                });
        });

        it("Includes letters of hidden species if user is an admin", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: true},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = true;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/valid_first_letters")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(3);
                    expect(res.body).to.contain("d");
                    expect(res.body).to.contain("c");
                    expect(res.body).to.contain("r");
                    done();
                });
        });
    });

    describe("GET / base listing endpoint", function() {
        it("Lists all species");
        it("Has the correct formats");
        it("Doesn't include hidden species");
        it("Includes hidden species if user is an admin");
    });

    describe("GET /id specific species endpoint", function() {
        it("Shows just one species");
        it("Fills out the species correctly");
        it("Returns 404 if the species doesn't exist");
        it("Returns 404 if the species is hidden");
        it("Displays hidden species information to admins");
    });

    describe("GET /?name= search by name endpoint", function() {
        it("Returns species whose latin names match");
        it("Returns species whose common names match");
        it("Returns species whose latin names match and species whose common names match");
        it("Handles wildcards");
        it("Does not include hidden species");
        it("Includes hidden species if user is admin");
    });

    describe("GET /?common_name= search by common name endpoint", function() {
        it("Returns species whose common names match");
        it("Does not return species with matching latin names");
        it("Handles wildcards");
        it("Does not include hidden species");
        it("Includes hidden species if user is admin");
    });

    describe("POST / create new species endpoint", function() {
        it("Creates a new species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);
            const newSpecies = {
                common_name: "A deer",
                latin_name: "cervus cervus",
                category_id: 1
            }

            requestRouter(speciesRouter)
                .post("/species/")
                .type("application/json")
                .send(newSpecies)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("object");
                    Species.check(res.body);
                    expect(speciesProvider.testSpecies).to.be.length(2);
                    done();
                });
        });

        it("Returns a 403 if not an admin", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);
            const newSpecies = {
                common_name: "A deer",
                latin_name: "cervus cervus",
                category_id: 1
            }

            requestRouter(speciesRouter)
                .post("/species/")
                .type("application/json")
                .send(newSpecies)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.be.an("object");
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(speciesProvider.testSpecies).to.be.length(1);
                    done();
                });
        });

        it("Returns a 403 if not logged in", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);
            const newSpecies = {
                common_name: "A deer",
                latin_name: "cervus cervus",
                category_id: 1
            }

            requestRouter(speciesRouter)
                .post("/species/")
                .type("application/json")
                .send(newSpecies)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.be.an("object");
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(speciesProvider.testSpecies).to.be.length(1);
                    done();
                });
        });
    });

    describe("fillOutSpecies() method", function() {
        it("Adds zoo listings to a species");
    });
});
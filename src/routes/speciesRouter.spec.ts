import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {MockAuthChecker, MockSpeciesProvider, MockZoosProvider, requestRouter} from "../testMocks";
import {expect} from "chai";
import {SpeciesRouter} from "./speciesRouter";
import {Record, Number, String, Boolean, Array} from "runtypes";
import {NewSpeciesJson, SpeciesJson} from "../apiInterfaces";

chai.use(chaiHttp);

const Species = Record({
    species_id: Number,
    common_name: String,
    latin_name: String,
    category_id: Number,
    hidden: Boolean
});
const ZooEntryForSpecies = Record({
    zoo_species_id: Number,
    species_id: Number,
    zoo_id: Number,
    name: String,
    postcode: String,
    link: String,
    latitude: Number,
    longitude: Number
})
const FullSpecies = Record({
    species_id: Number,
    common_name: String,
    latin_name: String,
    category_id: Number,
    hidden: Boolean,
    zoos: Array(ZooEntryForSpecies)
});

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
                    expect(res.body).to.contain("C");
                    expect(res.body).to.contain("R");
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
                    expect(res.body).not.to.contain("C");
                    expect(res.body).to.contain("R");
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
                    expect(res.body).not.to.contain("D");
                    expect(res.body).to.contain("C");
                    expect(res.body).to.contain("R");
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
                    expect(res.body).to.contain("D");
                    expect(res.body).to.contain("C");
                    expect(res.body).to.contain("R");
                    done();
                });
        });
    });

    describe("GET / base listing endpoint", function() {
        it("Lists all species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(4);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    done();
                });
        });

        it("Doesn't include hidden species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: true},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: true},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.filter((x: SpeciesJson) => x.species_id == 1)).to.be.length(0);
                    expect(res.body.filter((x: SpeciesJson) => x.species_id == 2)).to.be.length(1);
                    done();
                });
        });

        it("Includes hidden species if user is an admin", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: true},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: true},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(4);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.filter((x: SpeciesJson) => x.species_id == 1)).to.be.length(1);
                    expect(res.body.filter((x: SpeciesJson) => x.species_id == 2)).to.be.length(1);
                    done();
                });
        });
    });

    describe("GET /id specific species endpoint", function() {
        it("Shows just one species");
        it("Fills out the species correctly");
        it("Returns 404 if the species doesn't exist");
        it("Returns 404 if the species is hidden");
        it("Displays hidden species information to admins");
    });

    describe("GET /?name= search by name endpoint", function() {
        it("Returns species whose latin names match", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?name=aves aves")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(1);
                    expect(res.body[0].species_id).to.be.equal(3);
                    expect(res.body[0].latin_name).to.be.equal("aves aves");
                    Species.check(res.body[0]);
                    done();
                });
        });

        it("Returns species whose common names match", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?name=Common bird")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(1);
                    expect(res.body[0].species_id).to.be.equal(3);
                    expect(res.body[0].latin_name).to.be.equal("aves aves");
                    Species.check(res.body[0]);
                    done();
                });
        });

        it("Returns species whose latin names match and species whose common names match", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rattus dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "aves aves", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?name=aves aves")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(3);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(4);
                    done();
                });
        });

        it("Handles wildcards", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false},
                {species_id: 5, latin_name: "aves differens", common_name: "Another bird", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?name=aves%")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(3);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(5);
                    done();
                });
        });

        it("Does not include hidden species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false},
                {species_id: 5, latin_name: "aves differens", common_name: "Common bird", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?name=aves%")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(1);
                    Species.check(res.body[0]);
                    expect(res.body[0].species_id).to.equal(3);
                    done();
                });
        });

        it("Includes hidden species if user is admin", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false},
                {species_id: 5, latin_name: "aves differens", common_name: "Another bird", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = true;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?name=aves%")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(3);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(5);
                    done();
                });
        });
    });

    describe("GET /?common_name= search by common name endpoint", function() {
        it("Returns species whose common names match", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?common_name=Common bird")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(1);
                    expect(res.body[0].species_id).to.be.equal(3);
                    expect(res.body[0].latin_name).to.be.equal("aves aves");
                    Species.check(res.body[0]);
                    done();
                });
        });

        it("Does not return species with matching latin names", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?common_name=aves aves")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(0);
                    done();
                });
        });

        it("Handles wildcards", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: false},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?common_name=Common%")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(3);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(4);
                    done();
                });
        });

        it("Does not include hidden species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: true},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?common_name=Common%")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(1);
                    Species.check(res.body[0]);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(3);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).not.to.contain(4);
                    done();
                });
        });

        it("Includes hidden species if user is admin", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false},
                {species_id: 2, latin_name: "cervus cervus", common_name: "Deer", category_id: 1, hidden: true},
                {species_id: 3, latin_name: "aves aves", common_name: "Common bird", category_id: 1, hidden: false},
                {species_id: 4, latin_name: "rattus rattus", common_name: "Common rat", category_id: 1, hidden: true}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            requestRouter(speciesRouter)
                .get("/species/?common_name=Common%")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body).to.be.length(2);
                    for(let species of res.body) {
                        Species.check(species);
                    }
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(3);
                    expect(res.body.map((x: SpeciesJson) => x.species_id)).to.contain(4);
                    done();
                });
        });
    });

    describe("POST / create new species endpoint", function() {
        it("Creates a new species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);
            const newSpecies: NewSpeciesJson = {
                common_name: "A deer",
                latin_name: "cervus cervus",
                category_id: 1,
                hidden: false
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
            const newSpecies: NewSpeciesJson = {
                common_name: "A deer",
                latin_name: "cervus cervus",
                category_id: 1,
                hidden: false
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
            const newSpecies: NewSpeciesJson = {
                common_name: "A deer",
                latin_name: "cervus cervus",
                category_id: 1,
                hidden: false
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
        it("Adds zoo listings to a species", function(done) {
            const speciesProvider = new MockSpeciesProvider([
                {species_id: 1, latin_name: "doggus doggus", common_name: "Rat dog", category_id: 1, hidden: false}
            ]);
            const zoosProvider = new MockZoosProvider([
                    {zoo_id: 1, name: "Test zoo", link: "http://example.com/1", postcode: "SA1 1AA", latitude: 24.23, longitude: -53.2},
                    {zoo_id: 2, name: "Zoo 2", link: "http://example.com/2", postcode: "SA2 1AA", latitude: 24.23, longitude: -53.2},
                    {zoo_id: 3, name: "Park 3", link: "http://example.com/3", postcode: "SA3 1AA", latitude: 24.23, longitude: -53.2}
                ],
                [
                    {zoo_species_id: 1, species_id: 1, zoo_id: 1},
                    {zoo_species_id: 2, species_id: 1, zoo_id: 3}
                ]);
            const authChecker = new MockAuthChecker();
            const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);

            speciesRouter.fillOutSpecies(speciesProvider.testSpecies[0]).then(function(fullSpecies) {
                FullSpecies.check(fullSpecies);
                expect(fullSpecies.zoos).to.be.length(2);
                expect(fullSpecies.zoos.filter(x => x.zoo_id == 1)).to.be.length(1);
                expect(fullSpecies.zoos.filter(x => x.zoo_id == 2)).to.be.empty;
                expect(fullSpecies.zoos.filter(x => x.zoo_id == 3)).to.be.length(1);
                done();
            }).catch(function(err) {
                done(err);
            });
        });
    });
});
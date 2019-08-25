import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {MockAuthChecker, MockZooSpeciesProvider, requestRouter} from "../testMocks";
import {expect} from "chai";
import {ZooSpeciesRouter} from "./zooSpeciesRouter";
import {Record, Number} from "runtypes";

chai.use(chaiHttp);

const ZooSpecies = Record({
    zoo_species_id: Number,
    species_id: Number,
    zoo_id: Number
});

describe("Zoo species router", function() {
    describe("POST / endpoint", function () {
        it('should add a new zoo species link', function (done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const newLink = {
                zoo_id: 1,
                species_id: 1
            }

            requestRouter(zooSpeciesRouter)
                .post("/zoo_species/")
                .type("application/json")
                .send(newLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an("object");
                    ZooSpecies.check(res.body);
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(1);
                    done();
            });
        });

        it("should return 403 if not an admin", function(done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const newLink = {
                zoo_id: 1,
                species_id: 1
            }

            requestRouter(zooSpeciesRouter)
                .post("/zoo_species/")
                .type("application/json")
                .send(newLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    done();
                });
        });

        it("should return 403 if not logged in", function(done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const newLink = {
                zoo_id: 1,
                species_id: 1
            }

            requestRouter(zooSpeciesRouter)
                .post("/zoo_species/")
                .type("application/json")
                .send(newLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    done();
                });
        });
    });

    describe("DELETE / endpoint", function() {
        it("should delete a full zoo species link");

        it('should delete a new zoo species link');

        it("should return 403 if not an admin");

        it("should return 403 if not logged in");
    });
});
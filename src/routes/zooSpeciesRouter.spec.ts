import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {MockZooSpeciesProvider} from "../testMockProviders";
import {MockAuthChecker, requestRouter} from "../testMocks";
import {expect} from "chai";
import {ZooSpeciesRouter} from "./zooSpeciesRouter";
import {ZooSpeciesLink} from "../testMockRecords";

chai.use(chaiHttp);

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
                    ZooSpeciesLink.check(res.body);
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
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(0);
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
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(0);
                    done();
                });
        });
    });

    describe("DELETE / endpoint", function() {
        it("should delete a full zoo species link", function (done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([
                {zoo_species_id: 1, zoo_id: 3, species_id: 7},
                {zoo_species_id: 2, zoo_id: 3, species_id: 8},
                {zoo_species_id: 3, zoo_id: 3, species_id: 10}
            ]);
            const authChecker = new MockAuthChecker();
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const deleteLink = {zoo_species_id: 1, zoo_id: 3, species_id: 7}

            requestRouter(zooSpeciesRouter)
                .delete("/zoo_species/")
                .type("application/json")
                .send(deleteLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    expect(res.body).to.be.empty;
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(2);
                    expect(zooSpeciesProvider.testZooSpeciesLinks.filter(x => x.zoo_species_id == 1)).to.be.length(0);
                    done();
                });
        });

        it('should delete a new zoo species link', function(done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([
                {zoo_species_id: 1, zoo_id: 3, species_id: 7},
                {zoo_species_id: 2, zoo_id: 3, species_id: 8},
                {zoo_species_id: 3, zoo_id: 3, species_id: 10}
            ]);
            const authChecker = new MockAuthChecker();
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const deleteLink = {zoo_id: 3, species_id: 8}

            requestRouter(zooSpeciesRouter)
                .delete("/zoo_species/")
                .type("application/json")
                .send(deleteLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    expect(res.body).to.be.empty;
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(2);
                    expect(zooSpeciesProvider.testZooSpeciesLinks.filter(x => x.zoo_species_id == 2)).to.be.length(0);
                    done();
                });
        });

        it("should return 403 if not an admin", function (done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([
                {zoo_species_id: 1, zoo_id: 3, species_id: 7},
                {zoo_species_id: 2, zoo_id: 3, species_id: 8},
                {zoo_species_id: 3, zoo_id: 3, species_id: 10}
            ]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const deleteLink = {zoo_species_id: 1, zoo_id: 3, species_id: 7}

            requestRouter(zooSpeciesRouter)
                .delete("/zoo_species/")
                .type("application/json")
                .send(deleteLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(3);
                    done();
                });
        });

        it("should return 403 if not logged in", function(done) {
            const zooSpeciesProvider = new MockZooSpeciesProvider([
                {zoo_species_id: 1, zoo_id: 3, species_id: 7},
                {zoo_species_id: 2, zoo_id: 3, species_id: 8},
                {zoo_species_id: 3, zoo_id: 3, species_id: 10}
            ]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);

            const deleteLink = {zoo_id: 3, species_id: 10}

            requestRouter(zooSpeciesRouter)
                .delete("/zoo_species/")
                .type("application/json")
                .send(deleteLink)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(zooSpeciesProvider.testZooSpeciesLinks).to.be.length(3);
                    done();
                });
        });
    });
});
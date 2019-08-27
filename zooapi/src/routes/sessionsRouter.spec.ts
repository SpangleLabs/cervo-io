import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {SessionsRouter} from "./sessionsRouter";
import {MockSessionsProvider} from "../testMockProviders";
import {requestRouter} from "../testMocks";
import {expect} from "chai";
import {AuthChecker} from "../authChecker";
import {SessionToken} from "../testMockRecords";

chai.use(chaiHttp);
chai.use(require('chai-as-promised'));

describe("Sessions router", function() {
    describe('checkPassword() method', function () {
        it("should throw an error if no password hashes are given", function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            expect(function () {
                sessionsRouter.checkPassword("password", []);
            }).to.throw("User not in database or is locked out.");
            done();
        });

        it("should throw an error if multiple password hashes are given", function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            expect(function () {
                sessionsRouter.checkPassword("password", [
                    {password: "hash1"},
                    {password: "hash2"}
                ]);
            }).to.throw("User not in database or is locked out.");
            done();
        });

        it("should throw an error if hash result doesn't have a value", function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            expect(function () {
                sessionsRouter.checkPassword("password", [
                    {password: ""}
                ]);
            }).to.throw("User not in database or is locked out.");
            done();
        });

        it("should return true when given password matching the given hash", function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            sessionsRouter.checkPassword("password", [
                {password: "$2a$10$sa9TlNOJtMeNEkDMNGzsLebuc9HFZ1D6eCsGTdP6KQvn5h08br.O."}
            ]).then(function (isCorrect) {
                expect(isCorrect).to.be.true;
                done();
            });
        });

        it("should return false when password doesn't match hash", function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            sessionsRouter.checkPassword("password123", [
                {password: "$2a$10$sa9TlNOJtMeNEkDMNGzsLebuc9HFZ1D6eCsGTdP6KQvn5h08br.O."}
            ]).then(function (isCorrect) {
                expect(isCorrect).to.be.false;
                done();
            });
        });
    });

    describe('failedLogin() method', function () {
        it("should update the failed logins for the given user", function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);
            const testUser = "username";

            sessionsRouter.failedLogin(testUser).then(function () {
                expect(sessionsProvider.failedLogins.get(testUser)).to.be.equal(1);
                done();
            });
        });
    });

    describe('successfulLogin() method', function () {
        it("should reset failed login count", function (done) {
            const testUser = "username";
            const sessionsProvider = new MockSessionsProvider([]);
            sessionsProvider.users.push(
                {user_id: 1, username: testUser, is_admin: false}
            )
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);
            sessionsProvider.failedLogins.set(testUser, 3);

            sessionsRouter.successfulLogin(testUser, "127.0.0.1").then(function () {
                expect(sessionsProvider.failedLogins.get(testUser)).to.be.equal(0);
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it("should create a new session with a random token", function (done) {
            const testUser = "username";
            const sessionsProvider = new MockSessionsProvider([]);
            sessionsProvider.users.push(
                {user_id: 1, username: testUser, is_admin: false}
            )
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            let authToken1: string | null = null;
            sessionsRouter.successfulLogin(testUser, "127.0.0.1").then(function (token1) {
                expect(token1.token).not.to.be.equal("");
                authToken1 = token1.token;
                return sessionsRouter.successfulLogin(testUser, "127.0.0.1");
            }).then(function (token2) {
                expect(token2.token).not.to.be.equal("");
                expect(token2.token).not.to.be.equal(authToken1);
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it("should create a new session with an expiry time in the future", function (done) {
            const testUser = "username";
            const sessionsProvider = new MockSessionsProvider([]);
            sessionsProvider.users.push(
                {user_id: 1, username: testUser, is_admin: false}
            )
            const authChecker = new AuthChecker(sessionsProvider);
            const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

            sessionsRouter.successfulLogin(testUser, "127.0.0.1").then(function (token1) {
                const expiryDate = new Date(Date.parse(token1.expiry_time));
                expect(expiryDate).not.to.be.null;
                expect(expiryDate).to.be.above(new Date());
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });

    describe('endpoints', function () {
        describe('GET /', function () {
            it('should return session token when valid auth token given', function (done) {
                const sessionsProvider = new MockSessionsProvider([
                    {
                        user_id: 1,
                        username: "Test 1",
                        token: "authToken",
                        expiry_time: "2019-08-21T12:50:00",
                        ip_addr: "127.0.0.1",
                        is_admin: true
                    }
                ]);
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .get("/session/")
                    .set("authorization", "authToken")
                    .set("x-forwarded-for", "127.0.0.1")
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(200);
                        expect(res.body).to.be.a("object");
                        SessionToken.check(res.body);
                        done();
                    });
            });

            it('should return error if auth token is not provided', function (done) {
                const sessionsProvider = new MockSessionsProvider([]);
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .get("/session/")
                    .set("x-forwarded-for", "127.0.0.1")
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(403);
                        expect(res.body).to.be.a("object");
                        expect(res.body).to.have.property("error");
                        expect(res.body.error).to.be.equal("No auth token provided.");
                        done();
                    });
            });
        });

        describe('POST /', function () {
            it("should fail if username does not exist", function (done) {
                const sessionsProvider = new MockSessionsProvider([]);
                sessionsProvider.users.push(
                    {user_id: 1, username: "testUser", is_admin: true}
                )
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .post("/session/")
                    .set("x-forwarded-for", "127.0.0.1")
                    .send({
                        username: "testUser",
                        password: "password"
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(403);
                        expect(res.body).to.be.a("object");
                        expect(res.body).to.have.property("error");
                        expect(res.body.error).to.be.equal("User not in database or is locked out.");
                        done();
                    });
            });

            it("should fail login if given the wrong password", function (done) {
                const sessionsProvider = new MockSessionsProvider([]);
                const testUser = "testUser";
                sessionsProvider.validPasswordHashes.set(
                    testUser,
                    [{password: "$2a$10$sa9TlNOJtMeNEkDMNGzsLebuc9HFZ1D6eCsGTdP6KQvn5h08br.O."}]
                );
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .post("/session/")
                    .set("x-forwarded-for", "127.0.0.1")
                    .send({
                        username: "testUser",
                        password: "password123"
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(403);
                        expect(res.body).to.be.a("object");
                        expect(res.body).to.have.property("error");
                        expect(res.body.error).to.be.equal("Password incorrect.");
                        done();
                    });
            });

            it("should login and return a token when given the correct password", function (done) {
                const sessionsProvider = new MockSessionsProvider([]);
                const testUser = "testUser";
                sessionsProvider.users.push(
                    {user_id: 2, username: testUser, is_admin: false}
                )
                sessionsProvider.validPasswordHashes.set(
                    testUser,
                    [{password: "$2a$10$sa9TlNOJtMeNEkDMNGzsLebuc9HFZ1D6eCsGTdP6KQvn5h08br.O."}]
                );
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .post("/session/")
                    .set("x-forwarded-for", "127.0.0.1")
                    .send({
                        username: "testUser",
                        password: "password"
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(200);
                        expect(res.body).to.be.a("object");
                        expect(res.body).not.to.have.property("error");
                        SessionToken.check(res.body);
                        done();
                    });
            });

            it("should remove the old session token when a new one is created", function (done) {
                const testUser = "testUser";
                const expiryTime = new Date();
                const oldToken = "oldToken";
                expiryTime.setMinutes(expiryTime.getMinutes() + 20);
                const expiryTimeStr = expiryTime.toISOString().replace("Z", "").replace("T", " ");
                const sessionsProvider = new MockSessionsProvider([
                    {
                        user_id: 0,
                        username: testUser,
                        ip_addr: "127.0.0.1",
                        expiry_time: expiryTimeStr,
                        token: oldToken,
                        is_admin: true
                    }
                ]);
                sessionsProvider.validPasswordHashes.set(
                    testUser,
                    [{password: "$2a$10$sa9TlNOJtMeNEkDMNGzsLebuc9HFZ1D6eCsGTdP6KQvn5h08br.O."}]
                );
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .post("/session/")
                    .set("x-forwarded-for", "127.0.0.1")
                    .send({
                        username: "testUser",
                        password: "password"
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(200);
                        SessionToken.check(res.body);
                        expect(sessionsProvider.sessionTokens).to.be.length(1);
                        expect(sessionsProvider.sessionTokens[0].token).not.to.be.equal(oldToken);
                        done();
                    });
            })
        });

        describe('DELETE /', function () {
            it("should return an error if there is no matching token", function (done) {
                const sessionsProvider = new MockSessionsProvider([
                    {
                        user_id: 1,
                        username: "Test 1",
                        token: "authToken",
                        expiry_time: "2019-08-21T12:50:00",
                        ip_addr: "127.0.0.1",
                        is_admin: true
                    }
                ]);
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .delete("/session/")
                    .set("authorization", "differentToken")
                    .set("x-forwarded-for", "127.0.0.1")
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(403);
                        expect(res.body).to.have.property("error");
                        expect(res.body.error).to.be.equal("User is not logged in.");
                        done();
                    });
            });

            it("should return an error if no auth token is provided", function (done) {
                const sessionsProvider = new MockSessionsProvider([
                    {
                        user_id: 1,
                        username: "Test 1",
                        token: "authToken",
                        expiry_time: "2019-08-21T12:50:00",
                        ip_addr: "127.0.0.1",
                        is_admin: true
                    }
                ]);
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .delete("/session/")
                    .set("x-forwarded-for", "127.0.0.1")
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(403);
                        expect(res.body).to.have.property("error");
                        expect(res.body.error).to.be.equal("No auth token provided.");
                        done();
                    });
            });

            it("should delete the matching session token", function (done) {
                const sessionsProvider = new MockSessionsProvider([
                    {
                        user_id: 1,
                        username: "Test 1",
                        token: "authToken",
                        expiry_time: "2019-08-21T12:50:00",
                        ip_addr: "127.0.0.1",
                        is_admin: true
                    }
                ]);
                const authChecker = new AuthChecker(sessionsProvider);
                const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);

                requestRouter(sessionsRouter)
                    .delete("/session/")
                    .set("authorization", "authToken")
                    .set("x-forwarded-for", "127.0.0.1")
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(204);
                        expect(sessionsProvider.sessionTokens).to.be.length(0);
                        done();
                    });
            });
        });
    });
});
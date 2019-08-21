import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {SessionsRouter} from "./sessionsRouter";
import {MockSessionsProvider, requestRouter} from "../testMocks";
import {expect} from "chai";
import {Number, Record, String} from "runtypes";

chai.use(chaiHttp);
chai.use(require('chai-as-promised'));

const SessionToken = Record({
    user_id: Number,
    username: String,
    token: String,
    expiry_time: String
});
const TokenResponse = Record({
    username: String,
    token: String,
    expiry_time: String,
    ip_addr: String
})

describe("checkToken() method", function() {
    it('should raise error if multiple session tokens are returned', function (done) {
        const sessionsProvider = new MockSessionsProvider([
            {
                user_id: 1, username: "Test 1", token: "authToken", expiry_time: "2019-08-21T12:50:00", ip_addr: "127.0.0.1"
            },
            {
                user_id: 2, username: "Test 2", token: "authToken", expiry_time: "2019-08-21T12:53:00", ip_addr: "127.0.0.1"
            }
        ]);
        const sessionsRouter = new SessionsRouter(sessionsProvider);

        sessionsRouter.checkToken("authToken", "127.0.0.1").then(function () {
            done(new Error("Should not have returned token."));
        }).catch(function (err) {
            expect(err.toString()).to.be.equal("Error: User is not logged in.");
            done();
        })
    });

    it('should raise error if no session tokens are found', function (done) {
        const sessionsProvider = new MockSessionsProvider([
        ]);
        const sessionsRouter = new SessionsRouter(sessionsProvider);

        sessionsRouter.checkToken("authToken", "127.0.0.1").then(function () {
            done(new Error("Should not have returned token."));
        }).catch(function (err) {
            expect(err.toString()).to.be.equal("Error: User is not logged in.");
            done();
        })
    });

    it('should return session token when valid auth token given', function (done) {
        const sessionsProvider = new MockSessionsProvider([
            {
                user_id: 1, username: "Test 1", token: "authToken", expiry_time: "2019-08-21T12:50:00", ip_addr: "127.0.0.1"
            }
        ]);
        const sessionsRouter = new SessionsRouter(sessionsProvider);

        sessionsRouter.checkToken("authToken", "127.0.0.1").then(function (token) {
            expect(token).to.be.a("object");
            SessionToken.check(token);
            done();
        })
    });
});

describe('endpoints' , function () {
    describe('GET /', function () {
        it('should return session token when valid auth token given', function (done) {
            const sessionsProvider = new MockSessionsProvider([
                {
                    user_id: 1, username: "Test 1", token: "authToken", expiry_time: "2019-08-21T12:50:00", ip_addr: "127.0.0.1"
                }
            ]);
            const sessionsRouter = new SessionsRouter(sessionsProvider);

            requestRouter(sessionsRouter)
                .get("/session/")
                .set("authorization", "authToken")
                .set("x-forwarded-for", "127.0.0.1")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.a("object");
                    TokenResponse.check(res.body);
                    done();
                });
        });

        it('should get IP address from connection, if header not available');

        it('should return error if auth token is not provided', function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const sessionsRouter = new SessionsRouter(sessionsProvider);

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

    });

    describe('DELETE /', function () {

    });
});
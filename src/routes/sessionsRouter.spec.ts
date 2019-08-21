import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {SessionsRouter} from "./sessionsRouter";
import {Request} from "express";
import {MockSessionsProvider} from "../testMocks";
import {expect} from "chai";
import {Number, Record, String} from "runtypes";

chai.use(chaiHttp);
chai.use(require('chai-as-promised'));

const SessionToken = Record({
    user_id: Number,
    username: String,
    token: String,
    expiry_time: String,
    ip_addr: String
});

describe("checkLogin() method", function() {
    it('should raise error if auth token is not provided', function (done) {
        const sessionsProvider = new MockSessionsProvider([]);
        const sessionsRouter = new SessionsRouter(sessionsProvider);
        const request = <Request><unknown>{
            headers: {
            },
            connection: {
                remoteAddress: "127.0.0.1"
            }
        };

        sessionsRouter.checkLogin(request).then(function () {
            done(new Error("Should not have returned token."));
        }).catch(function (err) {
            expect(err.toString()).to.be.equal("Error: No auth token provided.");
            done();
        })
    });

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
        const request = <Request><unknown>{
            headers: {
                Authorization: "authToken"
            },
            connection: {
                remoteAddress: "127.0.0.1"
            }
        };

        sessionsRouter.checkLogin(request).then(function () {
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
        const request = <Request><unknown>{
            headers: {
                Authorization: "authToken"
            },
            connection: {
                remoteAddress: "127.0.0.1"
            }
        };

        sessionsRouter.checkLogin(request).then(function () {
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
        const request = <Request><unknown>{
            headers: {
                Authorization: "authToken"
            },
            connection: {
                remoteAddress: "127.0.0.1"
            }
        };

        sessionsRouter.checkLogin(request).then(function (token) {
            expect(token).to.be.a("object");
            SessionToken.check(token);
            done();
        })
    });

    it('should get IP address from header, if available', function (done) {
        const sessionsProvider = new MockSessionsProvider([
            {
                user_id: 1, username: "Test 1", token: "authToken", expiry_time: "2019-08-21T12:50:00", ip_addr: "127.0.0.1"
            }
        ]);
        const sessionsRouter = new SessionsRouter(sessionsProvider);
        const request = <Request><unknown>{
            headers: {
                Authorization: "authToken",
                "x-forwarded-for": "127.0.0.1"
            },
            connection: {
                remoteAddress: "192.168.0.4"
            }
        };

        sessionsRouter.checkLogin(request).then(function (token) {
            expect(token).to.be.a("object");
            SessionToken.check(token);
            done();
        })
    });
});

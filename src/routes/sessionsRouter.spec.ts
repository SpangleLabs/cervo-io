import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {SessionsRouter} from "./sessionsRouter";
import {Request} from "express";
import {MockSessionsProvider} from "../testMocks";
import {expect} from "chai";

chai.use(chaiHttp);
chai.use(require('chai-as-promised'));
//const should = chai.should();

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

        sessionsRouter.checkLogin(request).then(function (token) {
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

        sessionsRouter.checkLogin(request).then(function (token) {
            done(new Error("Should not have returned token."));
        }).catch(function (err) {
            expect(err.toString()).to.be.equal("Error: User is not logged in.");
            done();
        })
    });

    it('should raise error if no session tokens are found', function (done) {

    });

    it('should return session token when valid auth token given', function (done) {

    });

    it('should get IP address from header, if available', function (done) {

    });
});

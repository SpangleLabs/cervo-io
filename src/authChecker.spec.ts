import {MockSessionsProvider} from "./testMockProviders";
import {AuthChecker} from "./authChecker";
import {expect} from "chai";
import {Boolean, Number, Record, String} from "runtypes";

const SessionToken = Record({
    user_id: Number,
    username: String,
    token: String,
    expiry_time: String,
    is_admin: Boolean
});

describe("AuthChecker class" , function () {
    describe("checkToken() method", function () {
        it('should raise error if multiple session tokens are returned', function (done) {
            const sessionsProvider = new MockSessionsProvider([
                {
                    user_id: 1,
                    username: "Test 1",
                    token: "authToken",
                    expiry_time: "2019-08-21T12:50:00",
                    ip_addr: "127.0.0.1",
                    is_admin: true
                },
                {
                    user_id: 2,
                    username: "Test 2",
                    token: "authToken",
                    expiry_time: "2019-08-21T12:53:00",
                    ip_addr: "127.0.0.1",
                    is_admin: false
                }
            ]);
            const authChecker = new AuthChecker(sessionsProvider);

            authChecker.checkToken("authToken", "127.0.0.1").then(function () {
                done(new Error("Should not have returned token."));
            }).catch(function (err) {
                expect(err.toString()).to.be.equal("Error: User is not logged in.");
                done();
            })
        });

        it('should raise error if no session tokens are found', function (done) {
            const sessionsProvider = new MockSessionsProvider([]);
            const authChecker = new AuthChecker(sessionsProvider);

            authChecker.checkToken("authToken", "127.0.0.1").then(function () {
                done(new Error("Should not have returned token."));
            }).catch(function (err) {
                expect(err.toString()).to.be.equal("Error: User is not logged in.");
                done();
            })
        });

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

            authChecker.checkToken("authToken", "127.0.0.1").then(function (token) {
                expect(token).to.be.a("object");
                SessionToken.check(token);
                done();
            })
        });
    });
});

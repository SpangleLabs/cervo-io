import * as bcrypt from "bcryptjs";
import * as uuid from "uuid";
import {AbstractRouter} from "./abstractRouter";
import {SessionsProvider} from "../models/sessionsProvider";
import {AuthChecker} from "../authChecker";

const uuidv4 = uuid.v4;

export class SessionsRouter extends AbstractRouter {
    sessions: SessionsProvider;

    constructor(authChecker: AuthChecker, sessionsProvider: SessionsProvider) {
        super("/session", authChecker);
        this.sessions = sessionsProvider;
    }

    initialise(): void {
        const self = this;

        /* GET session info. */
        this.router.get('/', function (req, res, next) {
            const authToken = <string>req.headers['authorization'];
            const ipAddr = <string>req.ip;
            // Return the current session status if logged in
            self.authChecker.checkToken(authToken, ipAddr).then(function (tokenData) {
                res.json({
                    "user_id": tokenData.user_id,
                    "username": tokenData.username,
                    "token": tokenData.token,
                    "expiry_time": tokenData.expiry_time,
                    "ip_addr": ipAddr,
                    "is_admin": tokenData.is_admin
                });
            }).catch(function (err: Error) {
                res.status(403).json({"error": err.message});
            });
        });

        /* POST to create a new session (login) */
        this.router.post('/', function (req, res, next) {
            // Get password from post data
            const username = req.body.username;
            const password = req.body.password;
            // Get IP address
            const ipAddr = <string>req.ip;
            // Get hashed password from database, provided it's not locked
            self.sessions.getValidPasswordHash(username).then(function (storeResults) {
                return self.checkPassword(password, storeResults);
            }).then(function (compareResult) {
                if (!compareResult) {
                    return self.failedLogin(username).then(function () {
                        res.status(403).json({"error": "Password incorrect."});
                    });
                } else {
                    return self.successfulLogin(username, ipAddr).then(function (tokenData) {
                        const sessionResponse = {
                            "username": username,
                            "token": tokenData.token,
                            "expiry_time": tokenData.expiry_time,
                            "ip_addr": ipAddr,
                            "is_admin": tokenData.is_admin
                        };
                        res.json(sessionResponse);
                    });
                }
            }).catch(function (err) {
                res.status(403).json({"error": err.message});
            });
        });

        /* DELETE session (logout) */
        this.router.delete('/', function (req, res, next) {
            const authToken = <string>req.headers['authorization'];
            const ipAddr = <string>req.ip;
            // Blank token, password in database
            self.authChecker.checkToken(authToken, ipAddr).then(function (userId) {
                return self.sessions.deleteToken(userId.username);
            }).then(function () {
                res.status(204).json();
            }).catch(function (err) {
                res.status(403).json({"error": err.message});
            })
        });
    }

    checkPassword(password: string, passwordHashResults: {password: string}[]): Promise<boolean> {
        if (passwordHashResults.length !== 1 || !passwordHashResults[0]["password"]) {
            throw new Error("User not in database or is locked out.");
        }
        // Check password against stored hash
        return bcrypt.compare(password, passwordHashResults[0]["password"]);
    }

    failedLogin(username: string): Promise<void> {
        return this.sessions.setFailedLogin(username);
    }

    successfulLogin(username: string, ipAddr: string): Promise<{token: string, expiry_time: string, is_admin: boolean}> {
        const self = this;
        return this.sessions.resetFailedLogins(username).then(function() {
            return self.sessions.deleteToken(username);
        }).then(function() {
            // Generate auth token
            const authToken = uuidv4();
            // Create expiry time
            const expiryTime = new Date();
            expiryTime.setHours(expiryTime.getHours()+10);
            const expiryTimeStr = expiryTime.toISOString().replace("Z", "").replace("T", " ");
            // Store auth token, IP, etc in database
            return self.sessions.createSession(username, authToken, expiryTimeStr, ipAddr).then(function () {
                return self.sessions.getUserData(username);
            }).then(function(userData) {
                return {
                    "token": authToken,
                    "expiry_time": expiryTimeStr,
                    "is_admin": userData[0].is_admin
                };
            });
        });
    }
}

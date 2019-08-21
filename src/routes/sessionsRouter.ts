import {Request} from "express";
import * as bcrypt from "bcryptjs";
import * as uuid from "uuid";
import {AbstractRouter} from "./abstractRouter";
import {SessionsProvider} from "../models/sessionsProvider";
const uuidv4 = uuid.v4;

export class SessionsRouter extends AbstractRouter {
    sessions: SessionsProvider;

    constructor(sessionsProvider: SessionsProvider) {
        super("/session");
        this.sessions = sessionsProvider;
    }

    initialise(): void {
        const self = this;
        /* GET home page. */
        this.router.get('/', function (req, res, next) {
            // Return the current session status if logged in
            self.checkLogin(req).then(function (tokenData) {
                res.json({
                    "status": "success",
                    "user_id": tokenData.user_id,
                    "username": tokenData.username,
                    "token": tokenData.token,
                    "expiry_time": tokenData.expiry_time
                });
            }).catch(function (err: Error) {
                res.status(403).json({"status": "failure", "error": err.message});
            });
        });

        this.router.post('/', function (req, res, next) {
            // Get password from post data
            const username = req.body.username;
            const password = req.body.password;
            // Get hashed password from database, provided it's not locked
            self.sessions.getValidPasswordHash(username).then(function (storeResult) {
                if (storeResult.length !== 1 || !storeResult[0]["password"]) {
                    return Promise.reject("User not in database or locked out.");
                }
                // Check password against stored hash
                return bcrypt.compare(password, storeResult[0]["password"]);
            }).then(function (compareResult) {
                if (!compareResult) {
                    return self.sessions.setFailedLogin(username).then(function () {
                        res.status(403).json({"status": "failure", "error": "Password incorrect"});
                        return Promise.reject("Password incorrect");
                    });
                } else {
                    return self.sessions.resetFailedLogins(username).then(function() {
                        // Generate auth token
                        const authToken = uuidv4();
                        // Get IP address
                        const ipAddr = <string>(req.headers["x-forwarded-for"] || req.connection.remoteAddress);
                        // Create expiry time
                        const expiryTime = new Date();
                        expiryTime.setDate(expiryTime.getDate());
                        const expiryTimeStr = expiryTime.toISOString().replace("Z", "").replace("T", " ");
                        // Store auth token, IP, etc in database
                        return self.sessions.createSession(username, authToken, expiryTimeStr, ipAddr).then(function () {
                            const sessionResponse = {
                                "status": "success",
                                "auth_token": authToken,
                                "expiry_time": expiryTime,
                                "ip_addr": ipAddr,
                                "username": username
                            };
                            res.json(sessionResponse);
                        });
                    });
                }
            }).catch(function (err) {
                console.log(err);
                res.status(403).json({"status": "failure", "error": err});
            });
        });

        this.router.delete('/', function (req, res, next) {
            // Blank token, password in database
            self.checkLogin(req).then(function (userId) {
                return self.sessions.deleteToken(userId.user_id)
            }).then(function () {
                res.status(204);
            }).catch(function (err) {
                res.status(403).json({"status": "failure", "error": err});
            })
        });
    }

    //Handy check login function?
    checkLogin(req: Request): Promise<SessionTokenJson> {
        const authToken = <string>req.headers['authorization'];
        const ipAddr = <string>(req.headers["x-forwarded-for"] || req.connection.remoteAddress);
        // Check auth header is provided
        if (!authToken) {
            return Promise.reject(new Error("No auth token provided."));
        }
        // Check expiry isn't in the past
        // Check auth header token matches database token
        return this.sessions.getSessionToken(authToken, ipAddr).then(function (storeResult) {
            if (storeResult.length !== 1 || !storeResult[0]["user_id"]) {
                throw new Error("User is not logged in.");
            } else {
                return storeResult[0];
            }
        });
    }
}

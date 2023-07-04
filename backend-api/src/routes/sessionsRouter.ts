import * as bcrypt from "bcryptjs"
import * as uuid from "uuid"
import {AbstractRouter} from "./abstractRouter"
import {SessionsProvider} from "../models/sessionsProvider"
import {AuthChecker} from "../authChecker"

const uuidv4 = uuid.v4

export class SessionsRouter extends AbstractRouter {
    sessions: SessionsProvider

    constructor(authChecker: AuthChecker, sessionsProvider: SessionsProvider) {
        super("/session", authChecker)
        this.sessions = sessionsProvider
    }

    initialise(): void {
        const self = this;

        /* GET session info. */
        this.router.get('/', async function (req, res, next) {
            const authToken = <string>req.headers['authorization']
            const ipAddr = <string>req.ip
            // Return the current session status if logged in
            try {
                const tokenData = await self.authChecker.checkToken(authToken, ipAddr)
                res.json({
                    "user_id": tokenData.user_id,
                    "username": tokenData.username,
                    "token": tokenData.token,
                    "expiry_time": tokenData.expiry_time,
                    "ip_addr": ipAddr,
                    "is_admin": tokenData.is_admin
                })
            } catch (err) {
                res.status(403).json({"error": err.message})
            }
        })

        /* POST to create a new session (login) */
        this.router.post('/', async function (req, res, next) {
            // Get password from post data
            const username = req.body.username;
            const password = req.body.password;
            // Get IP address
            const ipAddr = <string>req.ip;
            // Get hashed password from database, provided it's not locked
            try {
                const storeResults = await self.sessions.getValidPasswordHash(username)
                const compareResult = await self.checkPassword(password, storeResults)
                if (!compareResult) {
                    await self.failedLogin(username)
                    res.status(403).json({"error": "Password incorrect."});
                } else {
                    const tokenData = await self.successfulLogin(username, ipAddr)
                    const sessionResponse = {
                        "username": username,
                        "token": tokenData.token,
                        "expiry_time": tokenData.expiry_time,
                        "ip_addr": ipAddr,
                        "is_admin": tokenData.is_admin,
                    };
                    res.json(sessionResponse)
                }
            } catch (err) {
                res.status(403).json({"error": err.message})
            }
        })

        /* DELETE session (logout) */
        this.router.delete('/', async function (req, res, next) {
            const authToken = <string>req.headers['authorization'];
            const ipAddr = <string>req.ip;
            // Blank token, password in database
            try {
                const tokenJson = await self.authChecker.checkToken(authToken, ipAddr)
                await self.sessions.deleteToken(tokenJson.username)
                res.status(204).json()
            } catch (err) {
                res.status(403).json({"error": err.message})
            }
        })
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

    async successfulLogin(username: string, ipAddr: string): Promise<{token: string, expiry_time: string, is_admin: boolean}> {
        const self = this;
        await this.sessions.resetFailedLogins(username)
        await this.sessions.deleteToken(username)
        // Generate auth token
        const authToken = uuidv4()
        // Create expiry time
        const expiryTime = new Date()
        expiryTime.setHours(expiryTime.getHours()+10)
        const expiryTimeStr = expiryTime.toISOString().replace("Z", "").replace("T", " ")
        // Store auth token, IP, etc in database
        await self.sessions.createSession(username, authToken, expiryTimeStr, ipAddr)
        const userData = await self.sessions.getUserData(username)
        return {
            "token": authToken,
            "expiry_time": expiryTimeStr,
            "is_admin": userData[0].is_admin,
        }
    }
}

import {SessionsProvider} from "./models/sessionsProvider";
import {Request} from "express";
import {SessionTokenJson} from "./apiInterfaces";

export class AuthChecker {
    sessions: SessionsProvider

    constructor(sessionsProvider: SessionsProvider) {
        this.sessions = sessionsProvider;
    }

    isLoggedIn(req: Request): Promise<boolean> {
        const authToken = <string>req.headers['authorization'];
        const ipAddr = <string>req.ip;
        return this.checkToken(authToken, ipAddr).then(function () {
            return true;
        }).catch(function() {
            return false;
        })
    }

    isAdmin(req: Request): Promise<boolean> {
        const authToken = <string>req.headers['authorization'];
        const ipAddr = <string>req.ip;
        return this.checkToken(authToken, ipAddr).then(function (token) {
            return token.is_admin;
        }).catch(function() {
            return false;
        })
    }

    //Handy check login function?
    checkToken(authToken: string, ipAddr: string): Promise<SessionTokenJson> {
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

    filterOutHidden<T extends {hidden: boolean}>(req: Request, items: T[]): Promise<T[]> {
        return this.isAdmin(req).then(function(isAdmin) {
            if(!isAdmin) {
                items = items.filter(x => !x.hidden);
            }
            return items;
        });
    }
}
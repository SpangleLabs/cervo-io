import {SessionsProvider} from "./models/sessionsProvider";
import {Request} from "express";
import {SessionTokenJson} from "@cervoio/common-lib/src/apiInterfaces";

export class AuthChecker {
    sessions: SessionsProvider

    constructor(sessionsProvider: SessionsProvider) {
        this.sessions = sessionsProvider;
    }

    async isLoggedIn(req: Request): Promise<boolean> {
        const authToken = <string>req.headers['authorization'];
        const ipAddr = <string>req.ip;
        try {
            await this.checkToken(authToken, ipAddr)
            return true
        } catch (err) {
            return false
        }
    }

    async isAdmin(req: Request): Promise<boolean> {
        const authToken = <string>req.headers['authorization'];
        const ipAddr = <string>req.ip;
        try {
            const token = await this.checkToken(authToken, ipAddr)
            return token.is_admin
        } catch (err) {
            return false
        }
    }

    //Handy check login function?
    async checkToken(authToken: string, ipAddr: string): Promise<SessionTokenJson> {
        // Check auth header is provided
        if (!authToken) {
            return Promise.reject(new Error("No auth token provided."));
        }
        // Check expiry isn't in the past
        // Check auth header token matches database token
        const storeResult = await this.sessions.getSessionToken(authToken, ipAddr)
        if (storeResult.length !== 1 || !storeResult[0]["user_id"]) {
            throw new Error("User is not logged in.");
        } else {
            return storeResult[0];
        }
    }

    async filterOutHidden<T extends {hidden: boolean}>(req: Request, items: T[]): Promise<T[]> {
        const isAdmin = await this.isAdmin(req)
        if(!isAdmin) {
            items = items.filter(x => !x.hidden);
        }
        return items;
    }
}
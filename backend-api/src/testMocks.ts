import {AbstractRouter} from "./routes/abstractRouter";
import {Application, NextFunction, Request, Response} from "express";
import {handler404} from "./index";
import {request} from "chai";
import bodyParser = require("body-parser");
import {AuthChecker} from "./authChecker";
import {MockSessionsProvider} from "./testMockProviders";

const express = require('express');

const handler500Testing = function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err);
    // render the error page
    res.status(res.statusCode || 500);
    res.json(err);
};

function mockApp(router: AbstractRouter) {
    const App: Application = express();
    App.use(bodyParser.json());
    App.use(bodyParser.urlencoded({extended: false}));
    App.enable('trust proxy');

    router.register(App);

    App.use(handler404);
    App.use(handler500Testing);
    return App;
}

export function requestRouter(router: AbstractRouter) {
    const App = mockApp(router);
    return request(App);
}

export class MockAuthChecker extends AuthChecker {
    is_admin: boolean;
    is_logged_in: boolean;

    constructor() {
        const sessionsProvider = new MockSessionsProvider([]);
        super(sessionsProvider);
        this.is_admin = true;
        this.is_logged_in = true;
    }

    isLoggedIn(req: Request): Promise<boolean> {
        return Promise.resolve(this.is_logged_in);
    }

    isAdmin(req: Request): Promise<boolean> {
        return Promise.resolve(this.is_admin && this.is_logged_in);
    }

}
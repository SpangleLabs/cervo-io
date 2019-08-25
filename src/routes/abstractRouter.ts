import {Application, Router} from "express";
import {AuthChecker} from "../authChecker";

export abstract class AbstractRouter {
    router: Router;
    path: string;
    authChecker: AuthChecker;

    protected constructor(path: string, authChecker: AuthChecker) {
        this.router = Router();
        this.path = path;
        this.authChecker = authChecker;
        this.initialise();
    }

    abstract initialise(): void;

    register(app: Application): void {
        app.use(this.path, this.router);
    }
}
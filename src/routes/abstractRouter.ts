import {Application, Router} from "express";

export abstract class AbstractRouter {
    router: Router;
    path: string;

    protected constructor(path: string) {
        this.router = Router();
        this.path = path;
        this.initialise();
    }

    abstract initialise(): void;

    register(app: Application): void {
        app.use(this.path, this.router);
    }
}
import {AbstractRouter} from "./abstractRouter";

export class IndexRouter extends AbstractRouter {

    constructor() {
        super("/");
    }

    initialise() {
        /* GET home page. */
        this.router.get('/', function (req, res, next) {
            res.json({});
        });
    }
}

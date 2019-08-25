import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";

export class IndexRouter extends AbstractRouter {

    constructor(authChecker: AuthChecker) {
        super("/", authChecker);
    }

    initialise() {
        /* GET home page. */
        this.router.get('/', function (req, res, next) {
            res.json({});
        });
    }
}

import {ZooSpeciesProvider} from "../models/zooSpeciesProvider";
import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";

export class ZooSpeciesRouter extends AbstractRouter {
    zooSpecies: ZooSpeciesProvider;

    constructor(authChecker: AuthChecker, zooSpeciesProvider: ZooSpeciesProvider) {
        super("/zoo_species", authChecker);
        this.zooSpecies = zooSpeciesProvider;
    }

    initialise(): void {
        const self = this;

        /* POST a new zoo species link */
        this.router.post('/', function (req, res, next) {
            self.zooSpecies.addZooSpecies(req.body).then(function (newLink: ZooSpeciesLinkJson) {
                res.json(newLink);
            }).catch(function (err) {
                res.status(500).json(err);
            });
        });

        /* DELETE a zoo species link */
        this.router.delete('/', function (req, res, next) {
            self.zooSpecies.deleteZooSpecies(req.body).then(function () {
                res.json(req.body);
            }).catch(function (err) {
                res.status(500).json(err);
            });
        });
    }
}

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
        this.router.post('/', async function (req, res, next) {
            const isAdmin = await self.authChecker.isAdmin(req)
            if(isAdmin) {
                try {
                    const newLink = self.zooSpecies.addZooSpecies(req.body)
                    res.json(newLink)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                res.status(403).json({"error": "Not authorized."});
            }
        });

        /* DELETE a zoo species link */
        this.router.delete('/', async function (req, res, next) {
            const isAdmin = await self.authChecker.isAdmin(req)
            if (isAdmin) {
                try {
                    await self.zooSpecies.deleteZooSpecies(req.body)
                    res.status(204).json()
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                res.status(403).json({"error": "Not authorized."})
            }
        })
    }
}

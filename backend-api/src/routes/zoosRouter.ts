import {ZoosProvider} from "../models/zoosProvider";
import {SpeciesProvider} from "../models/speciesProvider";
import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";
import {FullZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {Request} from "express";

export class ZoosRouter extends AbstractRouter {
    zoos: ZoosProvider;
    species: SpeciesProvider;

    constructor(authChecker: AuthChecker, zoosProvider: ZoosProvider, speciesProvider: SpeciesProvider) {
        super("/zoos", authChecker);
        this.zoos = zoosProvider;
        this.species = speciesProvider;
    }

    initialise(): void {
        const self = this;

        /* GET zoos listing. */
        this.router.get('/:id?', async function (req, res, next) {
            if (req.params.id) {
                const zooId = Number(req.params.id);
                try {
                    const rows = await self.zoos.getZooById(zooId)
                    const fullRows = await Promise.all(rows.map(x => self.fillOutZoo(x, req)))
                    res.json(fullRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                try {
                    const rows = await self.zoos.getAllZoos()
                    res.json(rows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            }
        })

        /* POST a new zoo */
        this.router.post('/', async function (req, res, next) {
            const isAdmin = self.authChecker.isAdmin(req)
            if(isAdmin) {
                try {
                    const newZoo = await self.zoos.addZoo(req.body)
                    res.json(newZoo)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                res.status(403).json({"error": "Not authorized."})
            }
        });
    }

    async fillOutZoo(zoo: ZooJson, req: Request): Promise<FullZooJson> {
        const species = await this.species.getSpeciesByZooId(zoo.zoo_id)
        const filteredSpecies = await this.authChecker.filterOutHidden(req, species)
        return {
            zoo_id: zoo.zoo_id,
            name: zoo.name,
            link: zoo.link,
            postcode: zoo.postcode,
            latitude: zoo.latitude,
            longitude: zoo.longitude,
            species: filteredSpecies,
        }
    }
}

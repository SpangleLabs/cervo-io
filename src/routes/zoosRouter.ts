import {ZoosProvider} from "../models/zoosProvider";
import {SpeciesProvider} from "../models/speciesProvider";
import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";
import {FullZooJson, ZooJson} from "../apiInterfaces";
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
        this.router.get('/:id?', function (req, res, next) {
            if (req.params.id) {
                self.zoos.getZooById(req.params.id).then(function (rows) {
                    return Promise.all(rows.map(x => self.fillOutZoo(x, req)))
                }).then(function (fullRows) {
                    res.json(fullRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
            } else {
                self.zoos.getAllZoos().then(function (rows) {
                    res.json(rows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
            }
        });

        /* POST a new zoo */
        this.router.post('/', function (req, res, next) {
            self.authChecker.isAdmin(req).then(function (isAdmin) {
                if(isAdmin) {
                    self.zoos.addZoo(req.body).then(function (newZoo) {
                        res.json(newZoo);
                    }).catch(function (err) {
                        res.status(500).json(err);
                    });
                } else {
                    res.status(403).json({"error": "Not authorized."});
                }
            })
        });
    }

    fillOutZoo(zoo: ZooJson, req: Request): Promise<FullZooJson> {
        const self = this;
        return this.species.getSpeciesByZooId(zoo.zoo_id).then(function(species) {
            return self.authChecker.filterOutHidden(req, species);
        }).then(function(filteredSpecies) {
            const fullZoo: FullZooJson = {
                zoo_id: zoo.zoo_id,
                name: zoo.name,
                link: zoo.link,
                postcode: zoo.postcode,
                latitude: zoo.latitude,
                longitude: zoo.longitude,
                species: filteredSpecies
            };
            return fullZoo;
        })
    }
}

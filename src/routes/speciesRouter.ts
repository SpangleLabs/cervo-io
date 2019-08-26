import {SpeciesProvider} from "../models/speciesProvider";
import {ZoosProvider} from "../models/zoosProvider";
import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";
import {FullSpeciesJson, SpeciesJson} from "../apiInterfaces";
import {LetterJson} from "../dbInterfaces";
import {Request} from "express";

export class SpeciesRouter extends AbstractRouter {
    species: SpeciesProvider;
    zoos: ZoosProvider;

    constructor(authChecker: AuthChecker, speciesProvider: SpeciesProvider, zoosProvider: ZoosProvider) {
        super("/species", authChecker);
        this.species = speciesProvider;
        this.zoos = zoosProvider
    }

    initialise(): void {
        const self = this;

        /* GET list of valid first letters for species */
        this.router.get("/valid_first_letters", function (req, res, next) {
            self.species.getFirstLetters().then(function (letters: LetterJson[]) {
                return self.filterOutHidden(req, letters);
            }).then(function(filteredLetters: LetterJson[]) {
                    const letterList = filteredLetters.map(a => a.letter).filter(function(el,i,a){return i===a.indexOf(el)});
                    res.json(letterList);
            }).catch(function (err) {
                res.status(500).json(err);
            });
        });

        /* GET species listing. */
        this.router.get('/:id?', function (req, res, next) {
            // Requesting by ID
            if (req.params.id) {
                self.species.getSpeciesById(req.params.id).then(function (rows) {
                    return Promise.all(rows.map(x => self.fillOutSpecies(x)));
                }).then(function (fullRows) {
                    res.json(fullRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
                // Searching by (either latin or common) name
            } else if (req.query.name) {
                const search = req.query.name;
                self.species.getSpeciesByName(search).then(function (rows) {
                    return self.filterOutHidden(req, rows);
                }).then(function(filteredRows) {
                    res.json(filteredRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
                // Searching by common name
            } else if (req.query.common_name) {
                const search = req.query.common_name;
                self.species.getSpeciesByCommonName(search).then(function (rows) {
                    return self.filterOutHidden(req, rows);
                }).then(function(filteredRows) {
                    res.json(filteredRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
                // List all species
            } else {
                self.species.getAllSpecies().then(function (rows) {
                    return self.filterOutHidden(req, rows)
                }).then(function(filteredRows) {
                    res.json(filteredRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
            }
        });

        /* POST a new species */
        this.router.post('/', function (req, res, next) {
            self.authChecker.isAdmin(req).then(function(isAdmin) {
                if(isAdmin) {
                    self.species.addSpecies(req.body).then(function (newSpecies: SpeciesJson) {
                        res.json(newSpecies);
                    }).catch(function (err) {
                        res.status(500).json(err);
                    });
                } else {
                    res.status(403).json({"error": "Not authorized."});
                }
            })
        });
    }

    filterOutHidden<T extends {hidden: boolean}>(req: Request, items: T[]): Promise<T[]> {
        return this.authChecker.isAdmin(req).then(function(isAdmin) {
            if(!isAdmin) {
                items = items.filter(x => !x.hidden);
            }
            return items;
        });
    }

    fillOutSpecies(species: SpeciesJson): Promise<FullSpeciesJson> {
        return this.zoos.getZoosBySpeciesId(species.species_id).then(function(zoos) {
            const fullSpecies: FullSpeciesJson = {
                species_id: species.species_id,
                common_name: species.common_name,
                latin_name: species.latin_name,
                category_id: species.category_id,
                hidden: species.hidden,
                zoos: zoos
            };
            return fullSpecies;
        });
    }

}

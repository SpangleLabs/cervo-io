import {SpeciesProvider} from "../models/speciesProvider";
import {ZoosProvider} from "../models/zoosProvider";
import {AbstractRouter} from "./abstractRouter";

export class SpeciesRouter extends AbstractRouter {
    species: SpeciesProvider;
    zoos: ZoosProvider;

    constructor(speciesProvider: SpeciesProvider, zoosProvider: ZoosProvider) {
        super("/species");
        this.species = speciesProvider;
        this.zoos = zoosProvider
    }

    initialise(): void {
        const self = this;

        this.router.get("/valid_first_letters", function (req, res, next) {
            self.species.getFirstLetters().then(function (letters) {
                res.json(letters.map(a => a['letter']));
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
                    res.json(rows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
                // Searching by common name
            } else if (req.query.common_name) {
                const search = req.query.common_name;
                self.species.getSpeciesByCommonName(search).then(function (rows) {
                    res.json(rows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
                // List all species
            } else {
                self.species.getAllSpecies().then(function (rows) {
                    res.json(rows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
            }
        });

        this.router.post('/', function (req, res, next) {
            self.species.addSpecies(req.body).then(function () {
                res.json(req.body);
            }).catch(function (err) {
                res.status(500).json(err);
            });
        });
    }

    fillOutSpecies(species: SpeciesJson): Promise<FullSpeciesJson> {
        return this.zoos.getZoosBySpeciesId(species.species_id).then(function(zoos) {
            const fullSpecies: FullSpeciesJson = {
                species_id: species.species_id,
                common_name: species.common_name,
                latin_name: species.latin_name,
                category_id: species.category_id,
                zoos: zoos
            };
            return fullSpecies;
        });
    }

}

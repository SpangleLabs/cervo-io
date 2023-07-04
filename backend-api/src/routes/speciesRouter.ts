import {SpeciesProvider} from "../models/speciesProvider";
import {ZoosProvider} from "../models/zoosProvider";
import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";
import {FullSpeciesJson, SpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";
import {LetterJson} from "../dbInterfaces";

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
        this.router.get("/valid_first_letters", async function (req, res, next) {
            try {
                const letters: LetterJson[] = await self.species.getFirstLetters()
                const filteredLetters = await self.authChecker.filterOutHidden(req, letters)
                const letterList = filteredLetters.map(a => a.letter)
                    .filter((el, i, a) => i === a.indexOf(el))
                res.json(letterList);
            } catch (err) {
                res.status(500).json({"error": err})
            }
        })

        /* GET species listing. */
        this.router.get('/:id?', async function (req, res, next) {
            // Requesting by ID
            if (req.params.id) {
                const speciesId = Number(req.params.id);
                try {
                    const rows = await self.species.getSpeciesById(speciesId)
                    const filteredRows = await self.authChecker.filterOutHidden(req, rows)
                    const fullRows = await Promise.all(filteredRows.map(x => self.fillOutSpecies(x)))
                    res.json(fullRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
                // Searching by (either latin or common) name
            } else if (req.query.name) {
                const search = req.query.name.toString();
                try {
                    const rows = await self.species.getSpeciesByName(search)
                    const filteredRows = await self.authChecker.filterOutHidden(req, rows)
                    res.json(filteredRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
                // Searching by common name
            } else if (req.query.common_name) {
                const search = req.query.common_name.toString();
                try {
                    const rows = await self.species.getSpeciesByCommonName(search)
                    const filteredRows = await self.authChecker.filterOutHidden(req, rows)
                    res.json(filteredRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
                // List all species
            } else {
                try {
                    const rows = await self.species.getAllSpecies()
                    const filteredRows = await self.authChecker.filterOutHidden(req, rows)
                    res.json(filteredRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            }
        });

        /* POST a new species */
        this.router.post('/', async function (req, res, next) {
            const isAdmin = await self.authChecker.isAdmin(req)
            if(isAdmin) {
                try {
                    const newSpecies = await self.species.addSpecies(req.body)
                    res.json(newSpecies)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                res.status(403).json({"error": "Not authorized."})
            }
        })
    }

    async fillOutSpecies(species: SpeciesJson): Promise<FullSpeciesJson> {
        const zoos = await this.zoos.getZoosBySpeciesId(species.species_id)
        return {
            species_id: species.species_id,
            common_name: species.common_name,
            latin_name: species.latin_name,
            category_id: species.category_id,
            hidden: species.hidden,
            zoos: zoos
        };
    }
}

import {Router} from "express";
import {
    addSpecies,
    getAllSpecies,
    getFirstLetters,
    getSpeciesByCommonName,
    getSpeciesById,
    getSpeciesByName
} from "../models/species";
import {getZoosBySpeciesId} from "../models/zoos";

export const SpeciesRouter = Router();

function fillOutSpecies(species: SpeciesJson): Promise<FullSpeciesJson> {
    return getZoosBySpeciesId(species.species_id).then(function(zoos) {
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

SpeciesRouter.get("/valid_first_letters", function (req, res, next) {
    getFirstLetters().then(function (letters) {
        res.json(letters.map(a => a['letter']));
    }).catch(function (err) {
        res.status(500).json(err);
    });
});

/* GET species listing. */
SpeciesRouter.get('/:id?', function (req, res, next) {
    // Requesting by ID
    if (req.params.id) {
        getSpeciesById(req.params.id).then(function (rows) {
            return Promise.all(rows.map(x => fillOutSpecies(x)));
        }).then(function (fullRows) {
            res.json(fullRows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    // Searching by (either latin or common) name
    } else if (req.query.name) {
        const search = req.query.name;
        getSpeciesByName(search).then(function (rows) {
            res.json(rows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    // Searching by common name
    } else if (req.query.common_name) {
        const search = req.query.common_name;
        getSpeciesByCommonName(search).then(function (rows) {
            res.json(rows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    // List all species
    } else {
        getAllSpecies().then(function (rows) {
            res.json(rows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    }
});

SpeciesRouter.post('/', function (req, res, next) {
    addSpecies(req.body).then(function () {
        res.json(req.body);
    }).catch(function (err) {
        res.status(500).json(err);
    });
});


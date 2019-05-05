const express = require('express');
const Species = require("../models/Species.js");
const Zoos = require("../models/Zoos.js");
const router = express.Router();

/* GET species listing. */
router.get('/:id?', function (req, res, next) {
    if (req.params.id) {
        Species.getSpeciesById(req.params.id).then(function (rows) {
            const speciesZoos = [];
            for (let a = 0; a < rows.length; a++) {
                speciesZoos.push(Zoos.getZoosBySpeciesId(rows[a].species_id));
            }
            Promise.all(speciesZoos).catch(function (err) {
                res.json(err);
            }).then(function (values) {
                const data = [];
                for (let b = 0; b < rows.length; b++) {
                    const row_result = {};
                    row_result.species_id = rows[b].species_id;
                    row_result.common_name = rows[b].common_name;
                    row_result.latin_name = rows[b].latin_name;
                    row_result.category_id = rows[b].category_id;
                    row_result.zoos = values[b];
                    data.push(row_result);
                }
                res.json(data);
            });
        }).catch(function (err) {
            res.status(500).json(err);
        });
    } else {
        if(req.query.name) {
            const search = req.query.name;
            Species.getSpeciesByName(search).then(function (rows) {
                res.json(rows);
            }).catch(function (err) {
                res.status(500).json(err);
            })
        } else {
            Species.getAllSpecies().then(function (rows) {
                res.json(rows);
            }).catch(function (err) {
                res.status(500).json(err);
            });
        }
    }
});

router.post('/', function (req, res, next) {
    Species.addSpecies(req.body).then(function (count) {
        res.json(req.body);
    }).catch(function (err) {
        res.status(500).json(err);
    });
});

module.exports = router;

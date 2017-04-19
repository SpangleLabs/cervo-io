var express = require('express');
var Species = require("../models/Species.js");
var Zoos = require("../models/Zoos.js");
var Promise = require("promise");
var router = express.Router();

/* GET species listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Species.getSpeciesById(req.params.id).catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            var speciesZoos = [];
            for(var a = 0; a < rows.length; a++) {
                speciesZoos.push(Zoos.getZoosBySpeciesId(rows[a].species_id));
            }
            Promise.all(speciesZoos).catch(function(err) {
                res.json(err);
            }).then(function(values) {
                var data = [];
                for(var b = 0; b < rows.length; b++) {
                    var row_result = {};
                    row_result.species_id = rows[b].species_id;
                    row_result.common_name = rows[b].common_name;
                    row_result.latin_name = rows[b].latin_name;
                    row_result.category_id = rows[b].category_id;
                    row_result.zoos = values[b];
                    data.push(row_result);
                }
                res.json(data);
            });
        });
    } else {
        Species.getAllSpecies().catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    }
});

router.post('/', function(req, res, next) {
    Species.addSpecies(req.body).catch(function(err) {
        res.json(err);
    }).then(function(count) {
        res.json(req.body);
    });
});

module.exports = router;

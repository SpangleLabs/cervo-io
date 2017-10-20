var express = require('express');
var Zoos = require("../models/Zoos.js");
var Species = require("../models/Species.js");
var Promise = require("promise");
var router = express.Router();

/* GET zoos listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Zoos.getZooById(req.params.id).then(function(rows) {
            var zooSpecies = [];
            for(var a = 0; a < rows.length; a++) {
                zooSpecies.push(Species.getSpeciesByZooId(rows[a].zoo_id));
            }
            Promise.all(zooSpecies).catch(function(err) {
                res.json(err);
            }).then(function(values) {
                var data = [];
                for(var b = 0; b < rows.length; b++) {
                    var row_result = {};
                    row_result.zoo_id = rows[b].zoo_id;
                    row_result.name = rows[b].name;
                    row_result.postcode = rows[b].postcode;
                    row_result.link = rows[b].link;
                    row_result.species = values[b];
                    data.push(row_result);
                }
                res.json(data);
            });

        }).catch(function(err) {
            res.status(500).json(err);
        });
    } else {
        Zoos.getAllZoos().then(function(rows) {
            res.json(rows);
        }).catch(function(err) {
            res.status(500).json(err);
        });
    }
});

router.post('/', function(req, res, next) {
    Zoos.addZoo(req.body).then(function(count) {
        res.json(req.body);
    }).catch(function(err) {
        res.status(500).json(err);
    });
});

module.exports = router;

var express = require('express');
var Zoos = require("../models/Zoos.js");
var ZooSpecies = require("../models/ZooSpecies.js");
var Promise = require("promise");
var router = express.Router();

/* GET zoos listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Zoos.getZooById(req.params.id).catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            var zooSpecies = [];
            for(var a = 0; a < rows.length; a++) {
                zooSpecies.push(ZooSpecies.getZooSpeciesByZooId(rows[a].zoo_id));
            }
            Promise.all(zooSpecies).catch(function(err) {
                res.json(err);
            }).then(function(values) {
                var data = [];
                for(var b = 0; b < rows.length; b++) {
                    row_result = {};
                    row_result.zoo_id = rows[b].zoo_id;
                    row_result.name = rows[b].name;
                    row_result.postcode = rows[b].postcode;
                    row_result.link = rows[b].link;
                    row_result.species = values[b];
                    data.push(row_result);
                }
                res.json(data);
            });

        });
    } else {
        Zoos.getAllZoos().catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    }
});

router.post('/', function(req, res, next) {
    Zoos.addZoo(req.body).catch(function(err) {
        res.json(err);
    }).then(function(count) {
        res.json(req.body);
    });
});

module.exports = router;

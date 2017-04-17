var express = require('express');
var Species = require("../models/Species.js");
var router = express.Router();

/* GET species listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Species.getSpeciesById(req.params.id).catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    } else {
        Species.getAllSpecies().catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    }
});

module.exports = router;

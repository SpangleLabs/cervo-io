var express = require('express');
var Species = require("../models/Species.js");
var router = express.Router();

/* GET species listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Species.getSpeciesById(req.params.id, function(err, rows) {
            if(err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    } else {
        Species.getAllSpecies(function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    }
});

module.exports = router;

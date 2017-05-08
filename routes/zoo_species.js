var express = require('express');
var ZooSpecies = require("../models/ZooSpecies.js");
var router = express.Router();


router.post('/', function(req, res, next) {
    ZooSpecies.addZooSpecies(req.body).then(function(count) {
        res.json(req.body);
    }).catch(function(err) {
        res.json(err);
    });
});

router.delete('/', function(req, res, next) {
    ZooSpecies.deleteZooSpecies(req.body).then(function(count) {
        res.json(req.body);
    }).catch(function(err) {
        res.json(err);
    });
});

module.exports = router;

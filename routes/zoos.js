var express = require('express');
var Zoos = require("../models/Zoos.js");
var router = express.Router();

/* GET zoos listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Zoos.getZooById(req.params.id).catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    } else {
        Zoos.getAllZoos().catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    }
});

module.exports = router;

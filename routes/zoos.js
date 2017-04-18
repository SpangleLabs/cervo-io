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

router.post('/', function(req, res, next) {
    Zoos.addZoo(req.body, function(err, count) {
        if(err) {
            res.json(err);
        } else {
            res.json(req.body);
        }
    })
});

module.exports = router;

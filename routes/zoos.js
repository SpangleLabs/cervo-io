var express = require('express');
var Zoos = require("../models/Zoos.js");
var router = express.Router();

/* GET zoos listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Zoos.getZooById(req.params.id, function(err, rows) {
            if(err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    } else {
        Zoos.getAllZoos(function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    }
});

module.exports = router;

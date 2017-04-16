var express = require('express');
var Categories = require("../models/Categories.js");
var router = express.Router();

/* GET categories listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Categories.getCategoryById(req.params.id, function(err, rows) {
            if(err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    } else {
        Categories.getBaseCategories(function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    }
});

module.exports = router;

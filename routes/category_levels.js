var express = require('express');
var CategoryLevels = require("../models/CategoryLevels.js");
var router = express.Router();

/* GET category levels listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        CategoryLevels.getCategoryLevelById(req.params.id, function(err, rows) {
            if(err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    } else {
        CategoryLevels.getAllCategoryLevels(function(err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        })
    }
});

module.exports = router;

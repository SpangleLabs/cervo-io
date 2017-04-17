var express = require('express');
var CategoryLevels = require("../models/CategoryLevels.js");
var router = express.Router();

/* GET category levels listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        CategoryLevels.getCategoryLevelById(req.params.id).catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    } else {
        CategoryLevels.getAllCategoryLevels().catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            res.json(rows);
        });
    }
});

module.exports = router;

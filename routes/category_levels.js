var express = require('express');
var CategoryLevels = require("../models/CategoryLevels.js");
var router = express.Router();

/* GET category levels listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        CategoryLevels.getCategoryLevelById(req.params.id).then(function(rows) {
            res.json(rows);
        }).catch(function(err) {
            res.status(500).json(err);
        });
    } else {
        CategoryLevels.getAllCategoryLevels().then(function(rows) {
            res.json(rows);
        }).catch(function(err) {
            res.status(500).json(err);
        });
    }
});

module.exports = router;

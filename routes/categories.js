var express = require('express');
var Categories = require("../models/Categories.js");
var Species = require("../models/Species.js");
var Promise = require("promise");
var router = express.Router();

function add_subcategories_and_return(res, rows) {
    var subcategory_promises = [];
    var species_promises = [];
    for (var a = 0; a < rows.length; a++) {
        var category_id = rows[a].category_id;
        subcategory_promises.push(Categories.getCategoriesByParentId(category_id).then(function(sub_rows) {
            return sub_rows;
        }));
        species_promises.push(Species.getSpeciesByCategoryId(category_id).then(function(species) {
            return species;
        }));
    }
    Promise.all(subcategory_promises.concat(species_promises)).then(function(values) {
        var row_results = [];
        for (var b = 0; b < rows.length; b++) {
            var row_result = {};
            row_result.category_id = rows[b].category_id;
            row_result.name = rows[b].name;
            row_result.category_level_id = rows[b].category_level_id;
            row_result.parent_category_id = rows[b].parent_category_id;
            row_result.sub_categories = values[b];
            row_result.species = values[b+rows.length]; // I don't know if this is nightmares.
            row_results.push(row_result);
        }
        res.json(row_results);
    }).catch(function(err) {
        res.status(500).json(err);
    });
}

/* GET categories listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Categories.getCategoryById(req.params.id).then(function(rows) {
            add_subcategories_and_return(res, rows);
        }).catch(function(err) {
            res.status(500).json(err);
        });
    } else {
        Categories.getBaseCategories().then(function(rows) {
            add_subcategories_and_return(res, rows);
        }).catch(function(err) {
            res.status(500).json(err);
        });
    }
});

router.post('/', function(req, res, next) {
    Categories.addCategory(req.body).then(function(count) {
        res.json(req.body);
    }).catch(function(err) {
        res.status(500).json(err);
    });
});

module.exports = router;

var express = require('express');
var Categories = require("../models/Categories.js");
var Promise = require("promise");
var router = express.Router();

/* GET categories listing. */
router.get('/:id?', function(req, res, next) {
    if(req.params.id) {
        Categories.getCategoryById(req.params.id, function(err, rows) {
            if(err) {
                res.json(err);
            } else {
                var super_rows = rows;
                var rows_length = rows.length;
                for (var a = 0; a < rows_length; a++) {
                    Categories.getCategoriesByParentId(rows[0].category_id, function(err, rows) {
                        if(err) {
                            res.json(err);
                        } else {
                            super_rows[a].sub_categories = rows;
                        }
                    });
                }
                res.json(rows);
            }
        })
    } else {
        Categories.getBaseCategories().catch(function(err) {
            res.json(err);
        }).then(function(rows) {
            var subcategory_promises = [];
            for (var a = 0; a < rows.length; a++) {
                subcategory_promises.push(Categories.getCategoriesByParentId(rows[a].category_id).catch(function(err) {
                    res.json(err);
                }).then(function(sub_rows) {
                    return sub_rows;
                }));
            }
            Promise.all(subcategory_promises).catch(function(err) {
                res.json(err)
            }).then(function(values) {
                var row_results = [];
                for (var b = 0; b < rows.length; b++) {
                    var row_result = {};
                    row_result.category_id = rows[b].category_id;
                    row_result.name = rows[b].name;
                    row_result.category_level_id = rows[b].category_level_id;
                    row_result.parent_category_id = rows[b].parent_category_id;
                    row_result.sub_categories = values[b];
                    console.log(row_result);
                    row_results.push(row_result);
                }
                res.json(row_results);
            });
        });
    }
});

module.exports = router;

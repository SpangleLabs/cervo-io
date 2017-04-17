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
        Categories.getBaseCategories(function(err, rows) {
            if (err) {
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
    }
});

module.exports = router;

import {Router} from "express";
import {addCategory, getBaseCategories, getCategoriesByParentId, getCategoryById} from "../models/categories";
const Species = require("../models/Species.js");

export const CategoriesRouter = Router();

function add_subcategories(rows: CategoryJson[]): Promise<FullCategoryJson[]> {
    const children_promises: Promise<[CategoryJson[], SpeciesJson[]]>[] = [];
    for (let a = 0; a < rows.length; a++) {
        const category_id = rows[a].category_id;
        children_promises.push(
            Promise.all([
                getCategoriesByParentId(category_id),
                Species.getSpeciesByCategoryId(category_id)
            ])
        );
    }
    return Promise.all(children_promises).then(function (values) {
        const row_results: FullCategoryJson[] = [];
        for (let b = 0; b < rows.length; b++) {
            const row_result: FullCategoryJson = {
                category_id: rows[b].category_id,
                category_level_id: rows[b].category_level_id,
                name: rows[b].name,
                parent_category_id: rows[b].parent_category_id,
                sub_categories: values[b][0],
                species: values[b][1]
            };
            row_results.push(row_result);
        }
        return row_results;
    });
}

/* GET categories listing. */
CategoriesRouter.get('/:id?', function (req, res, next) {
    if (req.params.id) {
        getCategoryById(req.params.id).then(function (rows) {
            return add_subcategories(rows)
        }).then(function(fullRows) {
            res.json(fullRows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    } else {
        getBaseCategories().then(function (rows) {
            return add_subcategories(rows)
        }).then(function(fullRows) {
            res.json(fullRows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    }
});

CategoriesRouter.post('/', function (req, res, next) {
    addCategory(req.body).then(function () {
        res.json(req.body);
    }).catch(function (err) {
        res.status(500).json(err);
    });
});

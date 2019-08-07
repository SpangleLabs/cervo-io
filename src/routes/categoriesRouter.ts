import {Router} from "express";
import {addCategory, getBaseCategories, getCategoriesByParentId, getCategoryById} from "../models/categories";
import {getSpeciesByCategoryId} from "../models/species";


export const CategoriesRouter = Router();

function add_subcategories(rows: CategoryJson[]): Promise<FullCategoryJson[]> {
    const children_promises: Promise<FullCategoryJson>[] = [];
    for (const category of rows) {
        const category_id = category.category_id;
        children_promises.push(
            Promise.all([
                getCategoriesByParentId(category_id),
                getSpeciesByCategoryId(category_id)
            ]).then(function(children) {
                const subCategories = children[0];
                const species = children[1];
                const row_result: FullCategoryJson = {
                    category_id: category.category_id,
                    category_level_id: category.category_level_id,
                    name: category.name,
                    parent_category_id: category.parent_category_id,
                    sub_categories: subCategories,
                    species: species
                };
                return row_result;
            })
        );
    }
    return Promise.all(children_promises);
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

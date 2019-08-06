import {Router} from "express";
import {getAllCategoryLevels, getCategoryLevelById} from "../models/categoryLevels";


export const CategoryLevelsRouter = Router();

/* GET category levels listing. */
CategoryLevelsRouter.get('/:id?', function (req, res, next) {
    if (req.params.id) {
        getCategoryLevelById(req.params.id).then(function (rows) {
            res.json(rows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    } else {
        getAllCategoryLevels().then(function (rows) {
            res.json(rows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    }
});

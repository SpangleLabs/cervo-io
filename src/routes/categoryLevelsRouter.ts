import {CategoryLevelsProvider} from "../models/categoryLevelsProvider";
import {AbstractRouter} from "./abstractRouter";
import {AuthChecker} from "../authChecker";

export class CategoryLevelsRouter extends AbstractRouter {
    categoryLevels: CategoryLevelsProvider;

    constructor(authChecker: AuthChecker, categoryLevelsProvider: CategoryLevelsProvider) {
        super("/category_levels", authChecker);
        this.categoryLevels = categoryLevelsProvider;
    }

    initialise(): void {
        const self = this;

        /* GET category levels listing */
        this.router.get('/:id?', function (req, res, next) {
                if (req.params.id) {
                    self.categoryLevels.getCategoryLevelById(req.params.id).then(function (rows) {
                        res.json(rows);
                    }).catch(function (err) {
                        res.status(500).json(err);
                    });
                } else {
                    self.categoryLevels.getAllCategoryLevels().then(function (rows) {
                        res.json(rows);
                    }).catch(function (err) {
                        res.status(500).json(err);
                    });
                }
            }
        );
    }

    /* GET category levels listing. */

}
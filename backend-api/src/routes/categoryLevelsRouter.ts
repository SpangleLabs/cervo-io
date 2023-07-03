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
        this.router.get('/:id?', async function (req, res, next) {
                if (req.params.id) {
                    const categoryLevelId = Number(req.params.id);
                    try {
                        const rows = await self.categoryLevels.getCategoryLevelById(categoryLevelId)
                        res.json(rows)
                    } catch (err) {
                        res.status(500).json(err)
                    }
                } else {
                    try {
                        const rows = await self.categoryLevels.getAllCategoryLevels();
                        res.json(rows)
                    } catch (err) {
                        res.status(500).json(err)
                    }
                }
            }
        );
    }
}
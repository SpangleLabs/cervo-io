import {SpeciesProvider} from "../models/speciesProvider";
import {AbstractRouter} from "./abstractRouter";
import {CategoriesProvider} from "../models/categoriesProvider";
import {AuthChecker} from "../authChecker";

export class CategoriesRouter extends AbstractRouter {
    categories: CategoriesProvider;
    species: SpeciesProvider;

    constructor(authChecker: AuthChecker, categoryProvider: CategoriesProvider, speciesProvider: SpeciesProvider) {
        super("/categories", authChecker);
        this.categories = categoryProvider;
        this.species = speciesProvider;
    }

    initialise(): void {
        const self = this;

        /* GET categories listing. */
        this.router.get('/:id?', function (req, res, next) {
            if (req.params.id) {
                self.categories.getCategoryById(req.params.id).then(function (rows) {
                    return self.add_subcategories(rows)
                }).then(function(fullRows) {
                    res.json(fullRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
            } else {
                self.categories.getBaseCategories().then(function (rows) {
                    return self.add_subcategories(rows)
                }).then(function(fullRows) {
                    res.json(fullRows);
                }).catch(function (err) {
                    res.status(500).json(err);
                });
            }
        });

        /* POST new category */
        this.router.post('/', function (req, res, next) {
            self.authChecker.isAdmin(req).then(function(isAdmin) {
                if(isAdmin) {
                    self.categories.addCategory(req.body).then(function (newCategory: CategoryJson) {
                        res.json(newCategory);
                    }).catch(function (err) {
                        res.status(500).json(err);
                    });
                } else {
                    res.status(403).json({"error": "Not authorized."});
                }
            })

        });
    }

    add_subcategories(rows: CategoryJson[]): Promise<FullCategoryJson[]> {
        const self = this;
        const children_promises: Promise<FullCategoryJson>[] = [];
        for (const category of rows) {
            const category_id = category.category_id;
            children_promises.push(
                Promise.all([
                    self.categories.getCategoriesByParentId(category_id),
                    self.species.getSpeciesByCategoryId(category_id)
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
}


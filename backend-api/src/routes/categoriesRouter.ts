import {SpeciesProvider} from "../models/speciesProvider";
import {AbstractRouter} from "./abstractRouter";
import {CategoriesProvider} from "../models/categoriesProvider";
import {AuthChecker} from "../authChecker";
import {CategoryJson, FullCategoryJson} from "@cervoio/common-lib/src/apiInterfaces";
import {Request} from "express";

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
        this.router.get('/:id?', async function (req, res, next) {
            if (req.params.id) {
                const categoryId = Number(req.params.id)
                try {
                    const rows = await self.categories.getCategoryById(categoryId)
                    const filteredRows = await self.authChecker.filterOutHidden(req, rows)
                    const fullRows = await self.addSubcategories(filteredRows, req)
                    res.json(fullRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                try {
                    const rows = await self.categories.getBaseCategories()
                    const filteredRows = await self.authChecker.filterOutHidden(req, rows)
                    const fullRows = await self.addSubcategories(filteredRows, req)
                    res.json(fullRows)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            }
        })

        /* POST new category */
        this.router.post('/', async function (req, res, next) {
            const isAdmin = await self.authChecker.isAdmin(req)
            if (isAdmin) {
                try {
                    const newCategory = await self.categories.addCategory(req.body)
                    res.json(newCategory)
                } catch (err) {
                    res.status(500).json({"error": err})
                }
            } else {
                res.status(403).json({"error": "Not authorized."})
            }
        })
    }

    async addSubcategories(rows: CategoryJson[], req: Request): Promise<FullCategoryJson[]> {
        const self = this;
        const children_promises: Promise<FullCategoryJson>[] = [];
        for (const category of rows) {
            const category_id = category.category_id;
            children_promises.push(
                async function ()  {
                    const children = await Promise.all([
                        self.categories.getCategoriesByParentId(category_id),
                        self.species.getSpeciesByCategoryId(category_id)
                    ])
                    const [subCategories, species] = children
                    const filteredChildren = await Promise.all([
                        self.authChecker.filterOutHidden(req, subCategories),
                        self.authChecker.filterOutHidden(req, species)
                    ])
                    const [filteredSubCategories, filteredSpecies] = filteredChildren
                    const result: FullCategoryJson = {
                        category_id: category.category_id,
                        category_level_id: category.category_level_id,
                        name: category.name,
                        parent_category_id: category.parent_category_id,
                        hidden: category.hidden,
                        sub_categories: filteredSubCategories,
                        species: filteredSpecies
                    }
                    return result
                }()
            );
        }
        return await Promise.all(children_promises);
    }
}


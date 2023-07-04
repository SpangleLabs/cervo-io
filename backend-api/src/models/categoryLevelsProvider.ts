import {AbstractProvider} from "./abstractProvider"
import {CategoryJson, CategoryLevelJson, NewCategoryLevelJson} from "@cervoio/common-lib/src/apiInterfaces"

function processIntoCategoryLevelJson(data: CategoryLevelJson[] | any): CategoryLevelJson[] {
    return data.map( (datum: CategoryJson | any) => ({
        category_level_id: datum.category_level_id,
        name: datum.name
    }))
}

export class CategoryLevelsProvider extends AbstractProvider {
    
    async getAllCategoryLevels(): Promise<CategoryLevelJson[]> {
        const result = await this.pool.query("select * from category_levels")
        return processIntoCategoryLevelJson(result.rows)
    }

    async getCategoryLevelById(id: number): Promise<CategoryLevelJson[]> {
        const result = await this.pool.query("select * from category_levels where category_level_id=$1", [id])
        return processIntoCategoryLevelJson(result.rows)
    }

    async addCategoryLevel(newCategoryLevel: NewCategoryLevelJson): Promise<CategoryLevelJson> {
        const result = await this.pool.query(
            "insert into category_levels (`name`) values ($1) returning category_level_id",
            [newCategoryLevel.name]
        )
        return {
            category_level_id: result.rows[0].category_level_id,
            name: newCategoryLevel.name,
        }
    }

    async deleteCategoryLevel(id: number): Promise<void> {
        await this.pool.query("delete from category_levels where category_level_id=$1", [id])
    }
    
    async updateCategoryLevel(id: number, CategoryLevel: NewCategoryLevelJson): Promise<void> {
        await this.pool.query("update category_levels set name=$1 where category_level_id=$2", [CategoryLevel.name, id])
    }
}
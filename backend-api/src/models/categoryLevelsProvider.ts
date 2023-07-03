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
        await this.client.connect()
        const result = await this.client.query("select * from category_levels")
        await this.client.end()
        return processIntoCategoryLevelJson(result.rows)
    }

    async getCategoryLevelById(id: number): Promise<CategoryLevelJson[]> {
        await this.client.connect()
        const result = await this.client.query("select * from category_levels where category_level_id=$1", [id])
        await this.client.end()
        return processIntoCategoryLevelJson(result)
    }

    async addCategoryLevel(newCategoryLevel: NewCategoryLevelJson): Promise<CategoryLevelJson> {
        await this.client.connect()
        const result = await this.client.query(
            "insert into category_levels (`name`) values ($1) returning category_level_id",
            [newCategoryLevel.name]
        )
        await this.client.end()
        return {
            category_level_id: result.rows[0].category_level_id,
            name: newCategoryLevel.name,
        }
    }

    async deleteCategoryLevel(id: number): Promise<void> {
        await this.client.connect()
        await this.client.query("delete from category_levels where category_level_id=$1", [id])
        await this.client.end()
    }
    
    async updateCategoryLevel(id: number, CategoryLevel: NewCategoryLevelJson): Promise<void> {
        await this.client.connect()
        await this.client.query("update category_levels set name=$1 where category_level_id=$2", [CategoryLevel.name, id])
        await this.client.end()
    }
}
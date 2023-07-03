import {AbstractProvider} from "./abstractProvider"
import {CategoryJson, NewCategoryJson} from "@cervoio/common-lib/src/apiInterfaces"

function processIntoCategoryJson(data: CategoryJson[] | any): CategoryJson[] {
    return data.map((datum: CategoryJson | any) => (
        {
            category_id: datum.category_id,
            name: datum.name,
            category_level_id: datum.category_level_id,
            parent_category_id: datum.parent_category_id,
            hidden: datum.hidden,
        }
    ))
}

export class CategoriesProvider extends AbstractProvider {

    async getBaseCategories(): Promise<CategoryJson[]> {
        await this.client.connect()
        const result = await this.client.query("select * from categories where parent_category_id is null order by name")
        await this.client.end()
        return processIntoCategoryJson(result.rows)
    }

    async getCategoryById(id: number): Promise<CategoryJson[]> {
        await this.client.connect()
        const result = await this.client.query(
            "select * from categories where category_id=$1",
            [id]
        )
        await this.client.end()
        return processIntoCategoryJson(result.rows)
    }

    async getCategoriesByParentId(id: number): Promise<CategoryJson[]> {
        await this.client.connect()
        const result = await this.client.query(
            "select * from categories where parent_category_id=$1 order by name",
            [id]
        )
        await this.client.end()
        return processIntoCategoryJson(result.rows)
    }

    async addCategory(newCategory: NewCategoryJson): Promise<CategoryJson> {
        await this.client.connect()
        const result = await this.client.query(
            "insert into categories (`name`,`category_level_id`,`parent_category_id`) values ($1,$2,$3) returning category_id",
            [newCategory.name, newCategory.category_level_id, newCategory.parent_category_id]
        )
        await this.client.end()
        return {
            category_id: result.rows[0].category_id,
            category_level_id: newCategory.category_level_id,
            name: newCategory.name,
            parent_category_id: newCategory.parent_category_id,
            hidden: newCategory.hidden,
        }
    }

    async deleteCategory(id: number): Promise<void> {
        await this.client.connect()
        await this.client.query("delete from categories where zoo_id=$1", [id])
        await this.client.end()
    }

    async updateCategory(id: number, updatedCategory: NewCategoryJson): Promise<void> {
        await this.client.connect()
        await this.client.query(
            "update categories set name=$1, category_level_id=$2, parent_category_id=$3 where category_id=$4",
            [updatedCategory.name, updatedCategory.category_level_id, updatedCategory.parent_category_id, id]
        )
        await this.client.end()
    }
}

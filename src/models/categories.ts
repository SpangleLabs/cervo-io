import {connection} from "../dbconnection";

export function getBaseCategories(): Promise<CategoryJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from categories where parent_category_id is null and hidden is false");
        conn.end()
        return result;
    });
}

export function getCategoryById(id: number): Promise<CategoryJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from categories where category_id=?", [id]);
        conn.end();
        return result;
    });
}

export function getCategoriesByParentId(id: number): Promise<CategoryJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from categories where parent_category_id=? and hidden is false", [id]);
        conn.end();
        return result;
    });
}

export function addCategory(newCategory: NewCategoryJson): Promise<CategoryJson> {
    return connection().then(function (conn) {
        const result = conn.query("insert into categories (`name`,`category_level_id`,`parent_category_id`) " +
            "values (?,?,?)", [newCategory.name, newCategory.category_level_id, newCategory.parent_category_id]);
        conn.end();
        return result.then(function (data: NewEntryData) {
            const result: CategoryJson = {
                category_id: data.insertId,
                category_level_id: newCategory.category_level_id,
                name: newCategory.name,
                parent_category_id: newCategory.parent_category_id
            };
            return result;
        })
    });
}

export function deleteCategory(id: number): Promise<void> {
    return connection().then(function (conn) {
        conn.query("delete from categories where zoo_id=?", [id]);
        conn.end();
        return;
    });
}

export function updateCategory(id: number, updatedCategory: NewCategoryJson): Promise<void> {
    return connection().then(function (conn) {
        conn.query("update categories set name=?, category_level_id=?, parent_category_id=? where category_id=?",
            [updatedCategory.name, updatedCategory.category_level_id, updatedCategory.parent_category_id, id]);
        conn.end();
        return ;
    });
}

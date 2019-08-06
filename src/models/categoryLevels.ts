import {connection} from "../dbconnection";

export function getAllCategoryLevels(): Promise<CategoryLevelJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from category_levels");
        conn.end();
        return result;
    });
}

export function getCategoryLevelById(id: number): Promise<CategoryLevelJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from category_levels where category_level_id=?", [id]);
        conn.end();
        return result;
    });
}

export function addCategoryLevel(CategoryLevel: NewCategoryLevelJson): Promise<void> {
    return connection().then(function (conn) {
        conn.query("insert into category_levels (`name`) values (?)", [CategoryLevel.name]);
        conn.end();
        return;
    });
}

export function deleteCategoryLevel(id: number): Promise<void> {
    return connection().then(function (conn) {
        conn.query("delete from category_levels where category_level_id=?", [id]);
        conn.end();
        return;
    });
}

export function updateCategoryLevel(id: number, CategoryLevel: NewCategoryLevelJson): Promise<void> {
    return connection().then(function (conn) {
        conn.query("update category_levels set name=? where category_level_id=?", [CategoryLevel.name, id]);
        conn.end();
        return;
    });
}

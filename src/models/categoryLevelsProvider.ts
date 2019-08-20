import {ConnectionProvider} from "../dbconnection";
import {AbstractProvider} from "./abstractProvider";

function processIntoCategoryLevelJson(data: CategoryLevelJson[] | any): CategoryLevelJson[] {
    return data.map(function (datum: CategoryJson | any) {
        return {
            category_level_id: datum.category_level_id,
            name: datum.name
        }
    });
}

export class CategoryLevelsProvider extends AbstractProvider {

    constructor (connection: ConnectionProvider) {
        super(connection);
    }
    
    getAllCategoryLevels(): Promise<CategoryLevelJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from category_levels");
            conn.end();
            return result;
        }).then(processIntoCategoryLevelJson);
    }

    getCategoryLevelById(id: number): Promise<CategoryLevelJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from category_levels where category_level_id=?", [id]);
            conn.end();
            return result;
        }).then(processIntoCategoryLevelJson);
    }

    addCategoryLevel(newCategoryLevel: NewCategoryLevelJson): Promise<CategoryLevelJson> {
        return this.connection().then(function (conn) {
            const result = conn.query("insert into category_levels (`name`) values (?)", [newCategoryLevel.name]);
            conn.end();
            return result.then(function (data: NewEntryData) {
                const result: CategoryLevelJson = {
                    category_level_id: data.insertId,
                    name: newCategoryLevel.name
                };
                return result;
            });
        });
    }

    deleteCategoryLevel(id: number): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("delete from category_levels where category_level_id=?", [id]);
            conn.end();
            return;
        });
    }
    
    updateCategoryLevel(id: number, CategoryLevel: NewCategoryLevelJson): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("update category_levels set name=? where category_level_id=?", [CategoryLevel.name, id]);
            conn.end();
            return;
        });
    }
}
const db = require('../dbconnection');

const CategoryLevels = {

    getAllCategoryLevels: function () {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from category_levels");
            conn.end();
            return result;
        });
    },

    getCategoryLevelById: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from category_levels where category_level_id=?", [id]);
            conn.end();
            return result;
        });
    },

    addCategoryLevel: function (CategoryLevel) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into category_levels (`name`) values (?)", [CategoryLevel.name]);
            conn.end();
            return result;
        });
    },

    deleteCategoryLevel: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("delete from category_levels where category_level_id=?", [id]);
            conn.end();
            return result;
        });
    },

    updateCategoryLevel: function (id, CategoryLevel) {
        return db.connection().then(function (conn) {
            const result = conn.query("update category_levels set name=? where category_level_id=?", [CategoryLevel.name, id]);
            conn.end();
            return result;
        });
    }

};
module.exports = CategoryLevels;
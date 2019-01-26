const db = require('../dbconnection');

const CategoryLevels = {

    getAllCategoryLevels: function () {
        return db.connection().then(function (conn) {
            return conn.query("select * from category_levels");
        });
    },

    getCategoryLevelById: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from category_levels where category_level_id=?", [id]);
        });
    },

    addCategoryLevel: function (CategoryLevel) {
        return db.connection().then(function (conn) {
            return conn.query("insert into category_levels (`name`) values (?)", [CategoryLevel.name]);
        });
    },

    deleteCategoryLevel: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("delete from category_levels where category_level_id=?", [id]);
        });
    },

    updateCategoryLevel: function (id, CategoryLevel) {
        return db.connection().then(function (conn) {
            return conn.query("update category_levels set name=? where category_level_id=?", [CategoryLevel.name, id]);
        });
    }

};
module.exports = CategoryLevels;
const db = require('../dbconnection');

const CategoryLevels = {

    getAllCategoryLevels: function () {
        return db.connection().then(function (conn) {
            return conn.query("select * from category_levels")
                .finally(function () {
                    conn.end();
                });
        });
    },

    getCategoryLevelById: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from category_levels where category_level_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    addCategoryLevel: function (CategoryLevel) {
        return db.connection().then(function (conn) {
            return conn.query("insert into category_levels (`name`) values (?)", [CategoryLevel.name])
                .finally(function () {
                    conn.end();
                });
        });
    },

    deleteCategoryLevel: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("delete from category_levels where category_level_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    updateCategoryLevel: function (id, CategoryLevel) {
        return db.connection().then(function (conn) {
            return conn.query("update category_levels set name=? where category_level_id=?", [CategoryLevel.name, id])
                .finally(function () {
                    conn.end();
                });
        });
    }

};
module.exports = CategoryLevels;
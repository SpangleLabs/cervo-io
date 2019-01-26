const db = require('../dbconnection');

const Categories = {

    getBaseCategories: function () {
        return db.connection().then(function (conn) {
            return conn.query("select * from categories where parent_category_id is null");
        });
    },

    getCategoryById: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from categories where category_id=?", [id]);
        });
    },

    getCategoriesByParentId: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from categories where parent_category_id=?", [id]);
        });
    },

    addCategory: function (Category) {
        return db.connection().then(function (conn) {
            return conn.query("insert into categories (`name`,`category_level_id`,`parent_category_id`) " +
                "values (?,?,?)", [Category.name, Category.category_level_id, Category.parent_category_id]);
        });
    },

    deleteCategory: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("delete from categories where zoo_id=?", [id]);
        });
    },

    updateCategory: function (id, Category) {
        return db.connection().then(function (conn) {
            return conn.query("update categories set name=?, category_level_id=?, parent_category_id=? where category_id=?",
                [Category.name, Category.category_level_id, Category.parent_category_id, id]);
        });
    }

};
module.exports = Categories;
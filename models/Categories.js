const db = require('../dbconnection');

const Categories = {

    getBaseCategories: function () {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from categories where parent_category_id is null");
            conn.end();
            return result;
        });
    },

    getCategoryById: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from categories where category_id=?", [id]);
            conn.end();
            return result;
        });
    },

    getCategoriesByParentId: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from categories where parent_category_id=?", [id]);
            conn.end();
            return result;
        });
    },

    addCategory: function (Category) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into categories (`name`,`category_level_id`,`parent_category_id`) " +
                "values (?,?,?)", [Category.name, Category.category_level_id, Category.parent_category_id]);
            conn.end();
            return result;
        });
    },

    deleteCategory: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("delete from categories where zoo_id=?", [id]);
            conn.end();
            return result;
        });
    },

    updateCategory: function (id, Category) {
        return db.connection().then(function (conn) {
            const result = conn.query("update categories set name=?, category_level_id=?, parent_category_id=? where category_id=?",
                [Category.name, Category.category_level_id, Category.parent_category_id, id]);
            conn.end();
            return result;
        });
    }

};
module.exports = Categories;
var db=require('../dbconnection');

var CategoryLevels={

    getAllCategoryLevels:function(){
        return db.then(function(conn) {
            return conn.query("select * from category_levels");
        });
    },

    getCategoryLevelById:function(id){
        return db.then(function(conn) {
            return conn.query("select * from category_levels where category_level_id=?",[id]);
        });
    },

    addCategoryLevel:function(CategoryLevel){
        return db.then(function(conn) {
            return conn.query("insert into category_levels values (?)",[CategoryLevel.Name]);
        });
    },

    deleteCategoryLevel:function(id){
        return db.then(function(conn) {
            return conn.query("delete from category_levels where category_level_id=?",[id]);
        });
    },

    updateCategoryLevel:function(id,CategoryLevel){
        return db.then(function(conn) {
            return conn.query("update category_levels set name=? where category_level_id=?",[CategoryLevel.Name,id]);
        });
    }

};
module.exports=CategoryLevels;
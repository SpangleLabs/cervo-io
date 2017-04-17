var db=require('../dbconnection');

var Categories={

    getBaseCategories:function(){
        return db.then(function(conn) {
            return conn.query("select * from categories where parent_category_id is null");
        });
    },

    getCategoryById:function(id){
        return db.then(function(conn) {
            return conn.query("select * from categories where category_id=?",[id]);
        });
    },

    getCategoriesByParentId:function(id) {
        return db.then(function(conn) {
            return conn.query("select * from categories where parent_category_id=?",[id]);
        });
    },

    addCategory:function(Category,callback){
        return db.query("insert into categories values (?,?,?)",[Category.Name,Category.CategoryLevelId,Category.ParentCategoryId],callback);
    },

    deleteCategory:function(id,callback){
        return db.query("delete from categories where zoo_id=?",[id],callback);
    },

    updateCategory:function(id,Category,callback){
        return db.query("update categories set name=?, category_level_id=?, parent_category_id=? where category_id=?",[Category.Name,Category.CategoryLevelId,Category.ParentCategoryId,id],callback);
    }

};
module.exports=Categories;
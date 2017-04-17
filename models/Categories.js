var db=require('../dbconnection');

var Categories={

    getBaseCategories:function(callback){
        return db.query("select * from categories",callback);
    },

    getCategoryById:function(id,callback){
        return db.query("select * from categories where category_id=?",[id],callback);
    },

    getCategoriesByParentId:function(id,callback) {
        return db.query("select * from categories where parent_category_id=?",[id],callback);
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
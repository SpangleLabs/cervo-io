var db=require('../dbconnection');

var CategoryLevels={

    getAllCategoryLevels:function(callback){
        return db.query("select * from category_levels",callback);
    },

    getCategoryLevelById:function(id,callback){
        return db.query("select * from category_levels where category_level_id=?",[id],callback);
    },

    addCategoryLevel:function(CategoryLevel,callback){
        return db.query("insert into category_levels values (?)",[CategoryLevel.Name],callback);
    },

    deleteCategoryLevel:function(id,callback){
        return db.query("delete from category_levels where category_level_id=?",[id],callback);
    },

    updateCategoryLevel:function(id,CategoryLevel,callback){
        return db.query("update category_levels set name=? where category_level_id=?",[CategoryLevel.Name,id],callback);
    }

};
module.exports=Zoos;
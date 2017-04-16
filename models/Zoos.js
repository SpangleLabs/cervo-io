var db=require('../dbconnection'); //reference of dbconnection.js

var Zoos={

    getAllZoos:function(callback){
        return db.query("select * from zoos",callback);
    },

    getZooById:function(id,callback){
        return db.query("select * from zoos where zoo_id=?",[id],callback);
    },

    addZoo:function(Zoo,callback){
        return db.query("insert into zoos values (?,?,?)",[Zoo.Name,Zoo.Postcode,Zoo.Link],callback);
    },

    deleteZoo:function(id,callback){
        return db.query("delete from zoos where zoo_id=?",[id],callback);
    },

    updateZoo:function(id,Zoo,callback){
        return db.query("update zoos set name=?, postcode=?, link=? where zoo_id=?",[Zoo.Name,Zoo.Postcode,Zoo.Link,id],callback);
    }

};
module.exports=Zoos;
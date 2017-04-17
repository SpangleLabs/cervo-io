var db=require('../dbconnection');

var Zoos={

    getAllZoos:function(){
        return db.then(function(conn) {
            return conn.query("select * from zoos");
        });
    },

    getZooById:function(id){
        return db.then(function(conn) {
            return conn.query("select * from zoos where zoo_id=?",[id]);
        });
    },

    addZoo:function(Zoo){
        return db.then(function(conn) {
            return conn.query("insert into zoos values (?,?,?)",[Zoo.Name,Zoo.Postcode,Zoo.Link]);
        });
    },

    deleteZoo:function(id){
        return db.then(function(conn) {
            return conn.query("delete from zoos where zoo_id=?",[id]);
        });
    },

    updateZoo:function(id,Zoo){
        return db.then(function(conn) {
            return conn.query("update zoos set name=?, postcode=?, link=? where zoo_id=?",[Zoo.Name,Zoo.Postcode,Zoo.Link,id]);
        });
    }

};
module.exports=Zoos;
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

    getZoosBySpeciesId:function(species_id) {
        return db.then(function(conn) {
            return conn.query("select * from zoo_species " +
                "left join zoos on zoo_species.zoo_id = zoos.zoo_id " +
                "where zoo_species.species_id = ?",[species_id]);
        });
    },

    addZoo:function(Zoo){
        return db.then(function(conn) {
            return conn.query("insert into zoos (`name`,`postcode`,`link`) " +
                "values (?,?,?)",[Zoo.name,Zoo.postcode,Zoo.link]);
        });
    },

    deleteZoo:function(id){
        return db.then(function(conn) {
            return conn.query("delete from zoos where zoo_id=?",[id]);
        });
    },

    updateZoo:function(id,Zoo){
        return db.then(function(conn) {
            return conn.query("update zoos set name=?, postcode=?, link=? where zoo_id=?",
                [Zoo.name,Zoo.postcode,Zoo.link,id]);
        });
    }

};
module.exports=Zoos;
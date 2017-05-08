var db=require('../dbconnection');

var ZooSpecies={

    getZooSpeciesByZooId:function(id){
        return db.then(function(conn) {
            return conn.query("select * from zoo_species where zoo_id=?",[id]);
        });
    },

    getZooSpeciesBySpeciesId:function(id){
        return db.then(function(conn) {
            return conn.query("select * from zoo_species where species_id=?",[id]);
        });
    },

    addZooSpecies:function(ZooSpecies){
        return db.then(function(conn) {
            return conn.query("insert into zoo_species (`zoo_id`,`species_id`) " +
                "values (?,?)",[ZooSpecies.zoo_id,ZooSpecies.species_id]);
        });
    },

    deleteZooSpecies:function(ZooSpecies){
        return db.then(function(conn) {
            return conn.query("delete from zoo_species where zoo_species_id=?",[ZooSpecies.zoo_species_id]);
        }).catch(function(err) {
            return db.then(function(conn) {
                conn.query("delete from zoo_species where zoo_id=? and species_id=?",[ZooSpecies.zoo_id, ZooSpecies.species_id]);
            });
        });
    }

};
module.exports=ZooSpecies;
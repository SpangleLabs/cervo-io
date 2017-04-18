var db=require('../dbconnection');

var Species={

    getAllSpecies:function(){
        return db.then(function(conn) {
            return conn.query("select * from species");
        });
    },

    getSpeciesById:function(id){
        return db.then(function(conn) {
            return conn.query("select * from species where species_id=?",[id]);
        });
    },

    getSpeciesByCategoryId:function(id) {
        return db.then(function(conn) {
            return conn.query("select * from species where category_id=?",[id]);
        });
    },

    getSpeciesByZooId:function(zoo_id) {
        return db.then(function(conn) {
            return conn.query("select * from zoo_species " +
                "left join species on zoo_species.species_id = species.species_id " +
                "where zoo_species.zoo_id = ?",[zoo_id]);
        });
    },

    addSpecies:function(Species){
        return db.then(function(conn) {
            return conn.query("insert into species (`common_name`,`latin_name`,`category_id`) " +
                "values (?,?,?)",[Species.common_name,Species.latin_name,Species.category_id]);
        });
    },

    deleteSpecies:function(id){
        return db.then(function(conn) {
            return conn.query("delete from species where species_id=?",[id]);
        });
    },

    updateSpecies:function(id,Species){
        return db.then(function(conn) {
            return conn.query("update species set common_name=?, latin_name=?, category_id=? where species_id=?",
                [Species.common_name,Species.latin_name,Species.category_id,id]);
        });
    }

};
module.exports=Species;
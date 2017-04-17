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

    addSpecies:function(Zoo){
        return db.then(function(conn) {
            return conn.query("insert into species values (?,?,?)",[Zoo.CommonName,Zoo.LatinName,Zoo.CategoryId]);
        });
    },

    deleteSpecies:function(id){
        return db.then(function(conn) {
            return conn.query("delete from species where species_id=?",[id]);
        });
    },

    updateSpecies:function(id,Species){
        return db.then(function(conn) {
            return conn.query("update species set common_name=?, latin_name=?, category_id=? where species_id=?",[Zoo.CommonName,Zoo.LatinName,Zoo.CategoryId,id]);
        });
    }

};
module.exports=Species;
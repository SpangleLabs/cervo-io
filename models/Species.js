var db=require('../dbconnection');

var Species={

    getAllSpecies:function(callback){
        return db.query("select * from species",callback);
    },

    getSpeciesById:function(id,callback){
        return db.query("select * from species where species_id=?",[id],callback);
    },

    addSpecies:function(Zoo,callback){
        return db.query("insert into species values (?,?,?)",[Zoo.CommonName,Zoo.LatinName,Zoo.CategoryId],callback);
    },

    deleteSpecies:function(id,callback){
        return db.query("delete from species where species_id=?",[id],callback);
    },

    updateSpecies:function(id,Species,callback){
        return db.query("update species set common_name=?, latin_name=?, category_id=? where species_id=?",[Zoo.CommonName,Zoo.LatinName,Zoo.CategoryId,id],callback);
    }

};
module.exports=Species;
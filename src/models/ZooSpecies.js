const db = require('../dbconnection');

const ZooSpecies = {

    getZooSpeciesByZooId: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species where zoo_id=?", [id]);
            conn.end();
            return result;
        });
    },

    getZooSpeciesBySpeciesId: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species where species_id=?", [id]);
            conn.end();
            return result;
        });
    },

    addZooSpecies: function (ZooSpecies) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into zoo_species (`zoo_id`,`species_id`) " +
                "values (?,?)", [ZooSpecies.zoo_id, ZooSpecies.species_id]);
            conn.end();
            return result;
        });
    },

    deleteZooSpecies: function (ZooSpecies) {
        return db.connection().then(function (conn) {
            if (ZooSpecies.zoo_species_id) {
                const result = conn.query("delete from zoo_species where zoo_species_id=?", [ZooSpecies.zoo_species_id]);
                conn.end();
                return result;
            } else {
                const result = conn.query("delete from zoo_species where zoo_id=? and species_id=?", [ZooSpecies.zoo_id, ZooSpecies.species_id]);
                conn.end();
                return result;
            }
        });
    }

};
module.exports = ZooSpecies;
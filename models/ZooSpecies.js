const db = require('../dbconnection');

const ZooSpecies = {

    getZooSpeciesByZooId: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from zoo_species where zoo_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    getZooSpeciesBySpeciesId: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from zoo_species where species_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    addZooSpecies: function (ZooSpecies) {
        return db.connection().then(function (conn) {
            return conn.query("insert into zoo_species (`zoo_id`,`species_id`) " +
                "values (?,?)", [ZooSpecies.zoo_id, ZooSpecies.species_id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    deleteZooSpecies: function (ZooSpecies) {
        return db.connection().then(function (conn) {
            if (ZooSpecies.zoo_species_id) {
                return conn.query("delete from zoo_species where zoo_species_id=?", [ZooSpecies.zoo_species_id])
                    .finally(function () {
                        conn.end();
                    });
            } else {
                return conn.query("delete from zoo_species where zoo_id=? and species_id=?", [ZooSpecies.zoo_id, ZooSpecies.species_id])
                    .finally(function () {
                        conn.end();
                    });
            }
        });
    }

};
module.exports = ZooSpecies;
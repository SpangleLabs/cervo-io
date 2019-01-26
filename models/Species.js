const db = require('../dbconnection');

const Species = {

    getAllSpecies: function () {
        return db.connection().then(function (conn) {
            return conn.query("select * from species")
                .finally(function () {
                    conn.end();
                });
        });
    },

    getSpeciesById: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from species where species_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    getSpeciesByCategoryId: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from species where category_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    getSpeciesByZooId: function (zoo_id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from zoo_species " +
                "left join species on zoo_species.species_id = species.species_id " +
                "where zoo_species.zoo_id = ?", [zoo_id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    addSpecies: function (Species) {
        return db.connection().then(function (conn) {
            return conn.query("insert into species (`common_name`,`latin_name`,`category_id`) " +
                "values (?,?,?)", [Species.common_name, Species.latin_name, Species.category_id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    deleteSpecies: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("delete from species where species_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    updateSpecies: function (id, Species) {
        return db.connection().then(function (conn) {
            return conn.query("update species set common_name=?, latin_name=?, category_id=? where species_id=?",
                [Species.common_name, Species.latin_name, Species.category_id, id])
                .finally(function () {
                    conn.end();
                });
        });
    }

};
module.exports = Species;
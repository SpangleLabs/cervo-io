const db = require('../dbconnection');

const Species = {

    getAllSpecies: function () {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from species");
            conn.end();
            return result;
        });
    },

    getSpeciesById: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from species where species_id=?", [id]);
            conn.end();
            return result;
        });
    },

    getSpeciesByCategoryId: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from species where category_id=?", [id]);
            conn.end();
            return result;
        });
    },

    getSpeciesByZooId: function (zoo_id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species " +
                "left join species on zoo_species.species_id = species.species_id " +
                "where zoo_species.zoo_id = ?", [zoo_id]);
            conn.end();
            return result;
        });
    },

    getSpeciesByName: function (search) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from species " +
                "where common_name like ? or latin_name like ? " +
                "order by common_name", [search, search]);
            conn.end();
            return result;
        });
    },

    getSpeciesByCommonName: function (search) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from species " +
                "where common_name like ? " +
                "order by common_name", [search]);
            conn.end();
            return result;
        });
    },

    addSpecies: function (Species) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into species (`common_name`,`latin_name`,`category_id`) " +
                "values (?,?,?)", [Species.common_name, Species.latin_name, Species.category_id]);
            conn.end();
            return result;
        });
    },

    deleteSpecies: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("delete from species where species_id=?", [id]);
            conn.end();
            return result;
        });
    },

    updateSpecies: function (id, Species) {
        return db.connection().then(function (conn) {
            const result = conn.query("update species set common_name=?, latin_name=?, category_id=? where species_id=?",
                [Species.common_name, Species.latin_name, Species.category_id, id]);
            conn.end();
            return result;
        });
    }

};
module.exports = Species;

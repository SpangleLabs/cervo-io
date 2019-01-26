const db = require('../dbconnection');

const Zoos = {

    getAllZoos: function () {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoos");
            conn.end();
            return result;
        });
    },

    getZooById: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoos where zoo_id=?", [id]);
            conn.end();
            return result;
        });
    },

    getZoosBySpeciesId: function (species_id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species " +
                "left join zoos on zoo_species.zoo_id = zoos.zoo_id " +
                "where zoo_species.species_id = ?", [species_id]);
            conn.end();
            return result;
        });
    },

    addZoo: function (Zoo) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into zoos (`name`,`postcode`,`latitude`,`longitude`,`link`) " +
                "values (?,?,?,?,?)", [Zoo.name, Zoo.postcode, Zoo.latitude, Zoo.longitude, Zoo.link]);
            conn.end();
            return result;
        });
    },

    deleteZoo: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("delete from zoos where zoo_id=?", [id]);
            conn.end();
            return result;
        });
    },

    updateZoo: function (id, Zoo) {
        return db.connection().then(function (conn) {
            const result = conn.query("update zoos set name=?, postcode=?, link=? where zoo_id=?",
                [Zoo.name, Zoo.postcode, Zoo.link, id]);
            conn.end();
            return result;
        });
    }

};
module.exports = Zoos;
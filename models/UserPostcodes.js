const db = require('../dbconnection');

const UserPostcodes = {

    getUserPostcodeById: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from user_postcodes where user_postcode_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    getUserPostcodeByPostcodeSector: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("select * from user_postcodes where postcode_sector=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    },

    addUserPostcode: function (UserPostcode) {
        return db.connection().then(function (conn) {
            return conn.query("insert into user_postcodes (`postcode_sector`) " +
                "values (?)", [UserPostcode.postcode_sector])
                .finally(function () {
                    conn.end();
                });
        });
    },

    deleteUserPostcode: function (id) {
        return db.connection().then(function (conn) {
            return conn.query("delete from user_postcodes where user_postcodes_id=?", [id])
                .finally(function () {
                    conn.end();
                });
        });
    }

};
module.exports = UserPostcodes;
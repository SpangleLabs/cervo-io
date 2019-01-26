const db = require('../dbconnection');

const UserPostcodes = {

    getUserPostcodeById: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from user_postcodes where user_postcode_id=?", [id]);
            conn.end();
            return result;
        });
    },

    getUserPostcodeByPostcodeSector: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from user_postcodes where postcode_sector=?", [id]);
            conn.end();
            return result;
        });
    },

    addUserPostcode: function (UserPostcode) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into user_postcodes (`postcode_sector`) " +
                "values (?)", [UserPostcode.postcode_sector]);
            conn.end();
            return result;
        });
    },

    deleteUserPostcode: function (id) {
        return db.connection().then(function (conn) {
            const result = conn.query("delete from user_postcodes where user_postcodes_id=?", [id]);
            conn.end();
            return result;
        });
    }

};
module.exports = UserPostcodes;
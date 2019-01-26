const db = require('../dbconnection');

const ZooDistances = {

    getZooDistanceByZooIdAndUserPostcodeId: function (zoo_id, user_postcode_id) {
        return db.connection().then(function (conn) {
            const result = conn.query("select * from zoo_distances where zoo_id=? and user_postcode_id=?", [zoo_id, user_postcode_id]);
            conn.end();
            return result;
        });
    },

    addZooDistance: function (ZooDistance) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into zoo_distances (`zoo_id`,`user_postcode_id`,`metres`) " +
                "values (?,?,?)", [ZooDistance.zoo_id, ZooDistance.user_postcode_id, ZooDistance.metres]);
            conn.end();
            return result;
        });
    }

};
module.exports = ZooDistances;
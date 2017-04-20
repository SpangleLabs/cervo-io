var db=require('../dbconnection');

var ZooDistances={

    getZooDistanceByZooIdAndUserPostcodeId:function(zoo_id, user_postcode_id) {
        return db.then(function(conn) {
            return conn.query("select * from zoo_distances where zoo_id=? and user_postcode_id=?",[zoo_id, user_postcode_id]);
        });
    },

    addZooDistance:function(ZooDistance){
        return db.then(function(conn) {
            return conn.query("insert into zoo_distances (`zoo_id`,`user_postcode_id`,`metres`) " +
                "values (?,?,?)",[ZooDistance.zoo_id,ZooDistance.user_postcode_id,ZooDistance.metres]);
        });
    }

};
module.exports=ZooDistances;
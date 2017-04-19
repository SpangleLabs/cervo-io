var db=require('../dbconnection');

var ZooDistances={

    addZooDistance:function(ZooDistance){
        return db.then(function(conn) {
            return conn.query("insert into zoo_distances (`zoo_id`,`user_postcode_id`,`metres`) " +
                "values (?,?)",[ZooDistance.zoo_id,ZooDistance.user_postcode_id,ZooDistance.metres]);
        });
    }

};
module.exports=ZooDistances;
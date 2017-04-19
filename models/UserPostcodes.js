var db=require('../dbconnection');

var UserPostcodes={

    getUserPostcodeById:function(id){
        return db.then(function(conn) {
            return conn.query("select * from user_postcodes where user_postcode_id=?",[id]);
        });
    },

    getUserPostcodeByPostcodeSector:function(id) {
        return db.then(function(conn) {
            return conn.query("select * from user_postcodes where postcode_sector=?",[id]);
        });
    },

    addUserPostcode:function(UserPostcode){
        return db.then(function(conn) {
            return conn.query("insert into user_postcodes (`postcode_sector`) " +
                "values (?)",[UserPostcode.postcode_sector]);
        });
    },

    deleteUserPostcode:function(id){
        return db.then(function(conn) {
            return conn.query("delete from user_postcodes where user_postcodes_id=?",[id]);
        });
    }

};
module.exports=UserPostcodes;
var db=require('../dbconnection');

var Species={

    getValidPasswordHash:function(){
        return db.then(function(conn) {
            const timestamp = new Date().getTime();
            return conn.query("IF((select value from config where key = ADMIN_UNLOCK_TIME)< ?," +
                "select value from config where key = ADMIN_PASSWORD," +
                "NULL)",[timestamp]);
        });
    }

};
module.exports=Species;
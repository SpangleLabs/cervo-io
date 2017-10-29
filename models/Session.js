var db=require('../dbconnection');

var Species={

    getValidPasswordHash:function(username){
        return db.then(function(conn) {
            const timestamp = new Date().getTime();
            return conn.query("select password from users where username = ? and unlock_time > ?",[username, timestamp]);
        });
    }

};
module.exports=Species;
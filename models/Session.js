var db=require('../dbconnection');

var Species={

    getValidPasswordHash:function(username){
        return db.then(function(conn) {
            const timestamp = new Date().getTime();
            return conn.query("select password from users where username = ? and unlock_time > ?",[username, timestamp]);
        });
    },

    setFailedLogin:function(username) {
        return db.then(function(conn) {
            const unlock_time = new Date().getTime()+86400;
            return conn.query("if (select failed_attempts from users where username = ?) then" +
                "(update users set unlock_time = ? where username = ?)" +
                "ELSE" +
                "(update users set failed_attempts = failed_attempts + 1 where username = ?)" +
                "end if", [username, unlock_time, username, username]);
        })
    }

};
module.exports=Species;
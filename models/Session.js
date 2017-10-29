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
            const unlockTime = new Date().getTime()+3600;
            return conn.query("if (select failed_attempts from users where username = ?) then" +
                "(update users set unlock_time = ? where username = ?)" +
                "ELSE" +
                "(update users set failed_attempts = failed_attempts + 1 where username = ?)" +
                "end if", [username, unlockTime, username, username]);
        });
    },

    resetFailedLogins:function(username) {
        return db.then(function(conn) {
            return conn.query("set failed_logins = 0 in users where username = ?", [username]);
        });
    },

    createSession:function(username, authToken, expiryTime, ipAddr) {
        return db.then(function(conn) {
            return conn.query("insert into user_sessions (user_id, token, expiry_time, ip_addr) " +
                "values ((select user_id from users where username = ?), ?, ?, ?)",
                [username, authToken, expiryTime, ipAddr]);
        });
    }

};
module.exports=Species;
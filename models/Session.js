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
            var unlockTime = new Date();
            unlockTime.setHours(unlockTime.getHours()+1);
            var unlockTimeStr = unlockTime.toISOString().replace("Z","").replace("T"," ");
            return conn.query("UPDATE users " +
                "SET unlock_time = IF(failed_logins>=3, ?, unlock_time)," +
                "failed_logins = IF(failed_logins>=3, 0, failed_logins + 1)" +
                "WHERE username = ?", [unlockTimeStr, username]);
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
const db = require('../dbconnection');

const Species = {

    getValidPasswordHash: function (username) {
        return db.connection.then(function (conn) {
            const timestamp = new Date().toISOString().replace("Z", "").replace("T", " ");
            return conn.query("select password from users where username = ? and unlock_time < ?", [username, timestamp]);
        });
    },

    setFailedLogin: function (username) {
        return db.connection.then(function (conn) {
            const unlockTime = new Date();
            unlockTime.setHours(unlockTime.getHours() + 1);
            const unlockTimeStr = unlockTime.toISOString().replace("Z", "").replace("T", " ");
            return conn.query("UPDATE users " +
                "SET unlock_time = IF(failed_logins>=3, ?, unlock_time)," +
                "failed_logins = IF(failed_logins>=3, 0, failed_logins + 1)" +
                "WHERE username = ?", [unlockTimeStr, username]);
        });
    },

    resetFailedLogins: function (username) {
        return db.connection.then(function (conn) {
            return conn.query("update users set failed_logins = 0 where username = ?", [username]);
        });
    },

    createSession: function (username, authToken, expiryTime, ipAddr) {
        return db.connection.then(function (conn) {
            return conn.query("insert into user_sessions (user_id, token, expiry_time, ip_addr) " +
                "select users.user_id, ?, ?, ? " +
                "from users " +
                "where users.username = ?",
                [authToken, expiryTime, ipAddr, username]);
        });
    },

    getSessionToken: function (authToken, ipAddr) {
        return db.connection.then(function (conn) {
            const currentTime = new Date().toISOString().replace("Z", "").replace("T", " ");
            return conn.query("SELECT user_id, users.username, token, expiry_time, ip_addr " +
                "FROM user_sessions " +
                "LEFT JOIN users ON user_sessions.user_id = users.user_id " +
                "WHERE token = ? AND ip_addr = ? AND expiry_time > ?",
                [authToken, ipAddr, currentTime]);
        })
    },

    deleteToken: function (userId) {
        return db.connection.then(function (conn) {
            return conn.query("DELETE FROM user_sessions WHERE user_id = ?", [userId]);
        })
    }

};
module.exports = Species;
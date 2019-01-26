const db = require('../dbconnection');

const Species = {

    getValidPasswordHash: function (username) {
        return db.connection().then(function (conn) {
            const timestamp = new Date().toISOString().replace("Z", "").replace("T", " ");
            const result = conn.query("select password from users where username = ? and unlock_time < ?", [username, timestamp]);
            conn.end();
            return result;
        })
    },

    setFailedLogin: function (username) {
        return db.connection().then(function (conn) {
            const unlockTime = new Date();
            unlockTime.setHours(unlockTime.getHours() + 1);
            const unlockTimeStr = unlockTime.toISOString().replace("Z", "").replace("T", " ");
            const result = conn.query("UPDATE users " +
                "SET unlock_time = IF(failed_logins>=3, ?, unlock_time)," +
                "failed_logins = IF(failed_logins>=3, 0, failed_logins + 1)" +
                "WHERE username = ?", [unlockTimeStr, username]);
            conn.end();
            return result;
        });
    },

    resetFailedLogins: function (username) {
        return db.connection().then(function (conn) {
            const result = conn.query("update users set failed_logins = 0 where username = ?", [username]);
            conn.end();
            return result;
        });
    },

    createSession: function (username, authToken, expiryTime, ipAddr) {
        return db.connection().then(function (conn) {
            const result = conn.query("insert into user_sessions (user_id, token, expiry_time, ip_addr) " +
                "select users.user_id, ?, ?, ? " +
                "from users " +
                "where users.username = ?",
                [authToken, expiryTime, ipAddr, username]);
            conn.end();
            return result;
        });
    },

    getSessionToken: function (authToken, ipAddr) {
        return db.connection().then(function (conn) {
            const currentTime = new Date().toISOString().replace("Z", "").replace("T", " ");
            const result = conn.query("SELECT user_id, users.username, token, expiry_time, ip_addr " +
                "FROM user_sessions " +
                "LEFT JOIN users ON user_sessions.user_id = users.user_id " +
                "WHERE token = ? AND ip_addr = ? AND expiry_time > ?",
                [authToken, ipAddr, currentTime]);
            conn.end();
            return result;
        });
    },

    deleteToken: function (userId) {
        return db.connection().then(function (conn) {
            const result = conn.query("DELETE FROM user_sessions WHERE user_id = ?", [userId]);
            conn.end();
            return result;
        });
    }

};
module.exports = Species;
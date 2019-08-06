import {connection} from "../dbconnection";


export function getValidPasswordHash(username: string): Promise<{password: string}[]> {
    return connection().then(function (conn) {
        const timestamp = new Date().toISOString().replace("Z", "").replace("T", " ");
        const result = conn.query("select password from users where username = ? and unlock_time < ?", [username, timestamp]);
        conn.end();
        return result;
    })
}

export function setFailedLogin(username: string): Promise<void> {
    return connection().then(function (conn) {
        const unlockTime = new Date();
        unlockTime.setHours(unlockTime.getHours() + 1);
        const unlockTimeStr = unlockTime.toISOString().replace("Z", "").replace("T", " ");
        conn.query("UPDATE users " +
            "SET unlock_time = IF(failed_logins>=3, ?, unlock_time)," +
            "failed_logins = IF(failed_logins>=3, 0, failed_logins + 1)" +
            "WHERE username = ?", [unlockTimeStr, username]);
        conn.end();
        return;
    });
}

export function resetFailedLogins(username: string): Promise<void> {
    return connection().then(function (conn) {
        conn.query("update users set failed_logins = 0 where username = ?", [username]);
        conn.end();
        return;
    });
}

export function createSession(username: string, authToken: string, expiryTime: string, ipAddr: string): Promise<void> {
    return connection().then(function (conn) {
        conn.query("insert into user_sessions (user_id, token, expiry_time, ip_addr) " +
            "select users.user_id, ?, ?, ? " +
            "from users " +
            "where users.username = ?",
            [authToken, expiryTime, ipAddr, username]);
        conn.end();
        return;
    });
}

export function getSessionToken(authToken: string, ipAddr: string): Promise<SessionTokenJson[]> {
    return connection().then(function (conn) {
        const currentTime = new Date().toISOString().replace("Z", "").replace("T", " ");
        const result = conn.query("SELECT user_id, users.username, token, expiry_time, ip_addr " +
            "FROM user_sessions " +
            "LEFT JOIN users ON user_sessions.user_id = users.user_id " +
            "WHERE token = ? AND ip_addr = ? AND expiry_time > ?",
            [authToken, ipAddr, currentTime]);
        conn.end();
        return result;
    });
}

export function deleteToken(userId: number): Promise<void> {
    return connection().then(function (conn) {
        conn.query("DELETE FROM user_sessions WHERE user_id = ?", [userId]);
        conn.end();
        return;
    });
}
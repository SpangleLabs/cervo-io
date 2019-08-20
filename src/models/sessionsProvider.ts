import {AbstractProvider} from "./abstractProvider";
import {ConnectionProvider} from "../dbconnection";

export class SessionsProvider extends AbstractProvider {

    constructor(connection: ConnectionProvider) {
        super(connection);
    }

    getValidPasswordHash(username: string): Promise<{ password: string }[]> {
        return this.connection().then(function (conn) {
            const timestamp = new Date().toISOString().replace("Z", "").replace("T", " ");
            const result = conn.query("select password from users where username = ? and unlock_time < ?", [username, timestamp]);
            conn.end();
            return result;
        }).then(function (data: { password: string }[]) {
            return data.map(x => {return {password: x.password}});
        });
    }

    setFailedLogin(username: string): Promise<void> {
        return this.connection().then(function (conn) {
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

    resetFailedLogins(username: string): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("update users set failed_logins = 0 where username = ?", [username]);
            conn.end();
            return;
        });
    }

    createSession(username: string, authToken: string, expiryTime: string, ipAddr: string): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("insert into user_sessions (user_id, token, expiry_time, ip_addr) " +
                "select users.user_id, ?, ?, ? " +
                "from users " +
                "where users.username = ?",
                [authToken, expiryTime, ipAddr, username]);
            conn.end();
            return;
        });
    }

    getSessionToken(authToken: string, ipAddr: string): Promise<SessionTokenJson[]> {
        return this.connection().then(function (conn) {
            const currentTime = new Date().toISOString().replace("Z", "").replace("T", " ");
            const result = conn.query("SELECT user_id, users.username, token, expiry_time, ip_addr " +
                "FROM user_sessions " +
                "LEFT JOIN users ON user_sessions.user_id = users.user_id " +
                "WHERE token = ? AND ip_addr = ? AND expiry_time > ?",
                [authToken, ipAddr, currentTime]);
            conn.end();
            return result;
        }).then(function (data: SessionTokenJson[] | any) {
            return data.map(function (datum: SessionTokenJson | any) {
                return {
                    user_id: datum.user_id,
                    username: datum.username,
                    token: datum.token,
                    expiry_time: datum.expiry_time,
                    ip_addr: datum.ip_addr
                }
            })
        });
    }

    deleteToken(userId: number): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("DELETE FROM user_sessions WHERE user_id = ?", [userId]);
            conn.end();
            return;
        });
    }
}
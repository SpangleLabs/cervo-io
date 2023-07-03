import {AbstractProvider} from "./abstractProvider"
import {SessionTokenJson} from "@cervoio/common-lib/src/apiInterfaces"

export class SessionsProvider extends AbstractProvider {

    async getValidPasswordHash(username: string): Promise<{ password: string }[]> {
        await this.client.connect()
        const timestamp = new Date().toISOString().replace("Z", "").replace("T", " ")
        const result = await this.client.query(
            "select password from users where username = $1 and unlock_time < $2",
            [username, timestamp]
        )
        await this.client.end()
        return result.rows.map(x => ({password: x.password}))
    }

    async setFailedLogin(username: string): Promise<void> {
        await this.client.connect()
        const unlockTime = new Date()
        unlockTime.setHours(unlockTime.getHours() + 1)
        const unlockTimeStr = unlockTime.toISOString().replace("Z", "").replace("T", " ")
        await this.client.query(
            "UPDATE users " +
            "SET unlock_time = IF(failed_logins>=3, $1, unlock_time)," +
            "failed_logins = IF(failed_logins>=3, 0, failed_logins + 1)" +
            "WHERE username = $2",
            [unlockTimeStr, username]
        )
    }

    async resetFailedLogins(username: string): Promise<void> {
        await this.client.connect()
        await this.client.query(
            "update users set failed_logins = 0 where username = $1",
            [username]
        )
        await this.client.end()
    }

    async createSession(username: string, authToken: string, expiryTime: string, ipAddr: string): Promise<void> {
        await this.client.connect()
        await this.client.query(
            "insert into user_sessions (user_id, token, expiry_time, ip_addr) " +
            "select users.user_id, $1, $2, $3 " +
            "from users " +
            "where users.username = $4",
            [authToken, expiryTime, ipAddr, username]
        )
        await this.client.end()
    }

    async getSessionToken(authToken: string, ipAddr: string): Promise<SessionTokenJson[]> {
        await this.client.connect()
        const currentTime = new Date().toISOString().replace("Z", "").replace("T", " ")
        const result = await this.client.query(
            "SELECT users.user_id, users.username, user_sessions.token, user_sessions.expiry_time, user_sessions.ip_addr, users.is_admin " +
            "FROM user_sessions " +
            "LEFT JOIN users ON user_sessions.user_id = users.user_id " +
            "WHERE token = $1 AND ip_addr = $2 AND expiry_time > $3",
            [authToken, ipAddr, currentTime]
        )
        await this.client.end()
        return result.rows.map(
            (datum: SessionTokenJson | any) => ({
                user_id: datum.user_id,
                username: datum.username,
                token: datum.token,
                expiry_time: datum.expiry_time,
                ip_addr: datum.ip_addr,
                is_admin: datum.is_admin
            })
        )
    }

    async getUserData(username: string): Promise<{user_id: number, username: string, is_admin: boolean}[]> {
        await this.client.connect()
        const result = await this.client.query(
            "SELECT user_id, username, is_admin FROM users WHERE username = $1",
            [username]
        )
        await this.client.end()
        return result.rows.map(
            (datum: any) => ({
                user_id: datum.user_id,
                username: datum.username,
                is_admin: datum.is_admin,
            })
        )
    }

    async deleteToken(username: string): Promise<void> {
        await this.client.connect()
        await this.client.query(
            "DELETE user_sessions FROM user_sessions LEFT JOIN users ON user_sessions.user_id = users.user_id WHERE users.username = $1",
            [username]
        )
        await this.client.end()
    }
}
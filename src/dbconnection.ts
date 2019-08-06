import {Connection, ConnectionConfig, createConnection} from "promise-mysql";
import {config} from "./config";

export function connection(): Promise<Connection> {

    const configMysql = config.mysql;

    const mysqlConfig: ConnectionConfig = {
        user: configMysql.username,
        password: configMysql.password,
        database: configMysql.database,
        host: configMysql.host,
        socketPath: configMysql.socketPath,
        connectTimeout: 5000
    };

    return createConnection(mysqlConfig).catch(function(err) {
        console.log("Mysql failed to make connection.");
        console.log(err);
    });
}

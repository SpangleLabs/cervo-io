import {Connection, ConnectionConfig, createConnection} from "promise-mysql";
import {config, Config} from "./config";

export function connection(customConfig?: Config): Promise<Connection> {

    let currentConfig = config;

    if(customConfig) {
        currentConfig = customConfig;
    }

    const configMysql = currentConfig.mysql;

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

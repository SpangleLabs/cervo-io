import {ConnectionProvider} from "../dbconnection";
import {Client} from "pg";

export abstract class AbstractProvider {
    connection: ConnectionProvider
    client: Client

    constructor(connection: ConnectionProvider, client: Client) {
        this.connection = connection
        this.client = client
    }
}

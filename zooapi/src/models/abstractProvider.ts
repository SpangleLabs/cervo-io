import {ConnectionProvider} from "../dbconnection";

export abstract class AbstractProvider {
    connection: ConnectionProvider;

    protected constructor(connection: ConnectionProvider) {
        this.connection = connection;
    }
}

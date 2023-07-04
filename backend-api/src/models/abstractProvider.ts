import {Client} from "pg";

export abstract class AbstractProvider {
    client: Client

    constructor(client: Client) {
        this.client = client
    }
}

import {Pool} from "pg";

export abstract class AbstractProvider {
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }
}

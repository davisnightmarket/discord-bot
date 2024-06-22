import type { MasterPool, RConnectionOptions, RDatabase } from 'rethinkdb-ts';
import { r } from 'rethinkdb-ts';
import type { RdbTableType, RdbDbType } from '../../model';

// so we only connect to the pool once
// note: this holds one connection per db
const waitingForConnectionPool: { [k in string]?: Promise<MasterPool> } = {};

export class RdbService {
    waitingForConnectionPool: Promise<MasterPool>;
    db: RDatabase;
    r: typeof r;
    constructor(
        private readonly dbName: RdbDbType,
        private readonly config: RConnectionOptions
    ) {
        this.waitingForConnectionPool =
            waitingForConnectionPool[this.dbName] ?? r.connectPool(this.config);
        this.r = r;
        this.db = r.db(this.dbName);
    }

    getTable(tableName: RdbTableType) {
        return this.db.table(tableName);
    }
}

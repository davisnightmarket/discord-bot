import type { MasterPool, RConnectionOptions, RDatabase } from 'rethinkdb-ts';
import { r } from 'rethinkdb-ts';
import type { RdbTableType, RedbDbType } from '../model/rdb.model';


export class RdbService {
    waitingForConnectionPool: Promise<MasterPool>;
    db: RDatabase;
    r: typeof r;
    constructor(
        private readonly dbName: RedbDbType,
        private readonly config: RConnectionOptions
    ) {
        this.config = config;
        this.waitingForConnectionPool = r.connectPool(this.config);
        this.r = r;
        this.db = r.db(this.dbName);
    }

    getTable(tableName: RdbTableType) {
        return this.db.table(tableName);
    }
}

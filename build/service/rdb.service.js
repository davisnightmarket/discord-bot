"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdbService = void 0;
const rethinkdb_ts_1 = require("rethinkdb-ts");
class RdbService {
    constructor(dbName, config) {
        this.dbName = dbName;
        this.config = config;
        this.config = config;
        this.waitingForConnectionPool = rethinkdb_ts_1.r.connectPool(this.config);
        this.r = rethinkdb_ts_1.r;
        this.db = rethinkdb_ts_1.r.db(this.dbName);
    }
    getTable(tableName) {
        return this.db.table(tableName);
    }
}
exports.RdbService = RdbService;

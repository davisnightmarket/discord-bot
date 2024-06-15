"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const utility_1 = require("../utility");
const rethinkdb_ts_1 = require("rethinkdb-ts");
run();
async function run() {
    const { rdbConfig } = await utility_1.WaitingForConfig;
    await rethinkdb_ts_1.r.connectPool(rdbConfig);
    const dbList = await rethinkdb_ts_1.r.dbList().run();
    const dbName = `nm-${(0, utility_1.GetEnv)()}`;
    if (!dbList.includes(dbName)) {
        console.log(`Creating table ${dbName}`);
        await rethinkdb_ts_1.r.dbCreate(dbName).run();
    }
    const db = rethinkdb_ts_1.r.db(dbName);
    const nmTable = [
        'entity',
        'access',
        'entity_person',
        'entity_market',
        'entity_organization',
        'action'
    ];
    const tableList = (await db.tableList().run());
    for (const table of nmTable) {
        if (!tableList.includes(table)) {
            console.log(`Creating DB ${table}`);
            await db.tableCreate(table).run();
        }
    }
    for (const table of tableList) {
        if (!nmTable.includes(table)) {
            console.log(`Dropping TABLE ${table}`);
            await db.tableDrop(table).run();
        }
    }
}
exports.run = run;

import { GetEnv, WaitingForConfig } from '../utility';
import { r } from 'rethinkdb-ts';
import { RdbTableType } from '../model/rdb.model';

run();
export async function run() {
    const { rdbConfig } = await WaitingForConfig;
    await r.connectPool(rdbConfig);

    const dbList = await r.dbList().run();

    const dbName = `nm-${GetEnv()}`;
    if (!dbList.includes(dbName)) {
        console.log(`Creating table ${dbName}`);

        await r.dbCreate(dbName).run();
    }
    const db = r.db(dbName);

    const nmTable: RdbTableType[] = [
        'entity',
        'access',
        'entity_person',
        'entity_market',
        'entity_organization',
        'action'
    ];

    const tableList = (await db.tableList().run()) as RdbTableType[];

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

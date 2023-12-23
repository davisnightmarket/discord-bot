import pg, { type Pool, type ConnectionConfig, type PoolClient } from 'pg';

const PoolMap: Record<string, Pool> = {};
export class PgService {
    pool: Pool;
    connection?: PoolClient;
    constructor(config: ConnectionConfig) {
        const k = (config.database as string) + (config.user as string);
        this.pool = PoolMap[k]
            ? PoolMap[k]
            : (PoolMap[k] = new pg.Pool(config));
    }

    // todo: create new connection?
    async query(sql: string) {
        if (!this.connection) {
            this.connection = await this.pool.connect();
        }
        return await this.connection.query(sql);
    }
}

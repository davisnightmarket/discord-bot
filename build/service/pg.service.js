"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgService = void 0;
const pg_1 = __importDefault(require("pg"));
const PoolMap = {};
class PgService {
    constructor(config) {
        const k = config.database + config.user;
        this.pool = PoolMap[k]
            ? PoolMap[k]
            : (PoolMap[k] = new pg_1.default.Pool(config));
    }
    // todo: create new connection?
    async query(sql) {
        if (!this.connection) {
            this.connection = await this.pool.connect();
        }
        return await this.connection.query(sql);
    }
}
exports.PgService = PgService;

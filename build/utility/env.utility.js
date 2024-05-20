"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEnv = void 0;
const envList = ['dev', 'test', 'prod'];
function GetEnv() {
    if (!envList.includes(process.env.NODE_ENV)) {
        console.error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
        return 'dev';
    }
    return process.env.NODE_ENV;
}
exports.GetEnv = GetEnv;

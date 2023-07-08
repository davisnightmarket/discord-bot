"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCron = void 0;
const bree_1 = __importDefault(require("bree"));
const path_1 = require("path");
// const jobs = [
//     // { name: 'scrape-data', interval: 'every 1 minute' },
//     // { name: 'backup-database', timeout: 'at 12:00 am' },
//     // { name: 'send-email', timeout: '1m', interval: '5m' }
// ];
const bree = new bree_1.default({
    root: (0, path_1.join)(process.cwd(), 'build/jobs')
});
bree.start();
const AddCron = (a) => {
    bree.add(a);
};
exports.AddCron = AddCron;
(0, exports.AddCron)({
    name: 'food-count-reminder',
    interval: 'every minute'
});

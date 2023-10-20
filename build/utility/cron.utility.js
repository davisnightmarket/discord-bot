"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const AddCron = (exp, f) => {
    node_cron_1.default.schedule(exp, f);
};
exports.AddCron = AddCron;
// cron.schedule('* * * * *', () => {
//     console.log('running a task every minute');
//     console.log(new Date().getDay());
// });

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllGuildIds = void 0;
const service_1 = require("../service");
const coreDataService = new service_1.CoreDataService();
// TODO: this is no longer needed
async function GetAllGuildIds() {
    return await coreDataService.getAllGuildIds();
}
exports.GetAllGuildIds = GetAllGuildIds;

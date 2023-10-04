"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGuildServices = void 0;
const utility_1 = require("../utility");
const service_1 = require("../service");
const servicesByGuildId = new Map();
// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
async function GetGuildServices(guildId) {
    if (!servicesByGuildId.has(guildId)) {
        const config = await (0, utility_1.GetConfigByGuildId)(guildId);
        const orgCoreService = new service_1.NmOrgService(config.GSPREAD_CORE_ORG_ID);
        const personCoreService = new service_1.NmPersonDataService(config.GSPREAD_CORE_PERSON_ID);
        servicesByGuildId.set(guildId, {
            config,
            opsDataService: new service_1.NmOpsDataService(config.GSPREAD_OPS_ID, personCoreService),
            foodCountDataService: new service_1.NmFoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
            foodCountInputService: new service_1.NmFoodCountInputService(orgCoreService),
            personCoreService,
            orgCoreService
        });
    }
    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId);
}
exports.GetGuildServices = GetGuildServices;

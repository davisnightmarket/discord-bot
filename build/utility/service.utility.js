"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGuildServices = void 0;
const service_1 = require("../service");
const coreDataService = new service_1.CoreDataService();
const servicesByGuildId = new Map();
// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
async function GetGuildServices(guildId) {
    if (!servicesByGuildId.has(guildId)) {
        const config = await coreDataService.getConfigByGuildId(guildId);
        const orgDataService = new service_1.OrgDataService(config.GSPREAD_ORG_ID);
        const personDataService = new service_1.PersonDataService(config.GSPREAD_PERSON_ID);
        servicesByGuildId.set(guildId, {
            config,
            coreDataService,
            nightDataService: new service_1.NightDataService(config.GSPREAD_NIGHT_ID, personDataService),
            foodCountDataService: new service_1.FoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
            foodCountInputService: new service_1.FoodCountInputService(orgDataService),
            personDataService,
            orgDataService
        });
    }
    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId);
}
exports.GetGuildServices = GetGuildServices;

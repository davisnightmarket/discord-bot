"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGuildServices = void 0;
const utility_1 = require("../utility");
const service_1 = require("../service");
// technically we want to instantiate this once,
// and don't really want services in utilities, but since our
// per-market config data is stored in a gspread, we kinda have to
// break the rules
const servicesByGuildId = new Map();
// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
async function GetGuildServices(guildId) {
    const { pgConfig, nmConfig } = await utility_1.WaitingForConfig;
    const coreDataService = new service_1.CoreDataService(nmConfig);
    if (!servicesByGuildId.has(guildId)) {
        const pgService = new service_1.PgService(pgConfig);
        const { GSPREAD_MARKET_ID } = await coreDataService.getMarketConfigByGuildId(guildId);
        const orgDataService = new service_1.OrgDataService(GSPREAD_MARKET_ID);
        const personDataService = new service_1.PersonDataService(GSPREAD_MARKET_ID, pgService);
        const nightDataService = new service_1.NightDataService(GSPREAD_MARKET_ID, personDataService);
        const markdownService = new service_1.MarkdownService(coreDataService);
        const marketAdminService = new service_1.MarketAdminService(GSPREAD_MARKET_ID, personDataService);
        servicesByGuildId.set(guildId, {
            markdownService,
            coreDataService,
            nightDataService,
            foodCountDataService: new service_1.FoodCountDataService(GSPREAD_MARKET_ID),
            foodCountInputService: new service_1.FoodCountInputService(orgDataService),
            personDataService,
            orgDataService,
            marketAdminService
        });
    }
    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId);
}
exports.GetGuildServices = GetGuildServices;

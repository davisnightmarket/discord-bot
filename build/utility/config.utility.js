"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitInstanceServices = exports.ConfigInstanceByGuildIdGet = void 0;
const config_1 = require("../config");
const nm_service_1 = require("../nm-service");
const ConfigInstanceByGuildIdGet = (id) => {
    return config_1.EnvConfig.find((config) => config.DISCORD_GUILD_ID === id);
};
exports.ConfigInstanceByGuildIdGet = ConfigInstanceByGuildIdGet;
function InitInstanceServices(config) {
    const orgCoreService = new nm_service_1.NmOrgService(config.GSPREAD_CORE_ORG_ID);
    return {
        foodCountDataService: new nm_service_1.NmFoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
        foodCountInputService: new nm_service_1.NmFoodCountInputService(orgCoreService),
        personCoreService: new nm_service_1.NmPersonDataService(config.GSPREAD_CORE_PERSON_ID),
        pickupsDataService: new nm_service_1.NmPickupsDataService(config),
        orgCoreService,
    };
}
exports.InitInstanceServices = InitInstanceServices;

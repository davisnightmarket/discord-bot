"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSerive = void 0;
const _1 = require(".");
const config_1 = require("../config");
const nm_service_1 = require("../nm-service");
const Env = process.env.NODE_ENV;
if (!Env || !Object.keys(config_1.EnvConfig).includes(Env)) {
    throw new Error('');
}
class ConfigSerive {
    constructor() {
        this.services = new Map();
        this.sheet = new _1.Sheet({
            sheetId: config_1.EnvConfig[Env].GSPREAD_CORE_CONFIG_ID,
            range: 'config-instance!A1:C'
        });
    }
    async getConfigForGuildId(guildId) {
        // get the market id
        const marketIdItem = await this.sheet.search({
            code: 'DISCORD_GUILD_ID',
            value: guildId
        });
        if (!marketIdItem) {
            throw new Error(`No config found for guild ${guildId}!`);
        }
        const marketId = marketIdItem.marketId;
        // build the config
        const items = await this.sheet.filter({ marketId });
        const config = { ...config_1.EnvConfig[Env] };
        for (const item of items) {
            config[item.code] = item.value;
        }
        // return
        return config;
    }
    getSericesFotTest() {
        const config = config_1.EnvConfig.test;
        const orgCoreService = new nm_service_1.NmOrgService(config.GSPREAD_CORE_ORG_ID);
        return {
            pickupsDataService: new nm_service_1.NmPickupsDataService(config),
            foodCountDataService: new nm_service_1.NmFoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
            foodCountInputService: new nm_service_1.NmFoodCountInputService(orgCoreService),
            personCoreService: new nm_service_1.NmPersonDataService(config.GSPREAD_CORE_PERSON_ID),
            orgCoreService
        };
    }
    async getServicesForGuildId(guildId) {
        if (!this.services.has(guildId)) {
            const config = await this.getConfigForGuildId(guildId);
            const orgCoreService = new nm_service_1.NmOrgService(config.GSPREAD_CORE_ORG_ID);
            this.services.set(guildId, {
                pickupsDataService: new nm_service_1.NmPickupsDataService(config),
                foodCountDataService: new nm_service_1.NmFoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
                foodCountInputService: new nm_service_1.NmFoodCountInputService(orgCoreService),
                personCoreService: new nm_service_1.NmPersonDataService(config.GSPREAD_CORE_PERSON_ID),
                orgCoreService
            });
        }
        // this can't be null since we just set it if it was
        return this.services.get(guildId);
    }
}
exports.ConfigSerive = ConfigSerive;

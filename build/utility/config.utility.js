"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllGuildIds = exports.GetConfigByGuildId = void 0;
const config_1 = require("../config");
const model_1 = require("../model");
const service_1 = require("../service");
const Env = process.env.NODE_ENV;
if (!Env || !Object.keys(config_1.EnvConfig).includes(Env)) {
    throw new Error('Must set an environment');
}
const coreConfigSheetService = new service_1.GoogleSheetService({
    spreadsheetId: config_1.EnvConfig[Env].GSPREAD_CORE_CONFIG_ID,
    sheetName: 'config-instance'
});
async function GetConfigByGuildId(guildId) {
    // get the market id
    const configRows = await coreConfigSheetService.getAllRowsAsMaps();
    const marketId = configRows.find((a) => a.code === 'DISCORD_GUILD_ID')?.marketId;
    if (!marketId) {
        throw new Error(`No config found for guild ${guildId}!`);
    }
    const configRow = (await coreConfigSheetService.getAllRowsAsMaps()).filter((row) => row.marketId === marketId);
    // build the config
    const config = { ...config_1.EnvConfig[Env] };
    for (const row of configRow) {
        config[row.code] = row.value;
    }
    // return
    return new model_1.ConfigModel(config);
}
exports.GetConfigByGuildId = GetConfigByGuildId;
async function GetAllGuildIds() {
    // get the market id
    const configRows = await coreConfigSheetService.getAllRowsAsMaps();
    return configRows
        .filter((a) => a.code === 'DISCORD_GUILD_ID')
        .map((a) => a.marketId);
}
exports.GetAllGuildIds = GetAllGuildIds;

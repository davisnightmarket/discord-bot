"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreDataService = void 0;
const config_1 = require("../config");
const model_1 = require("../model");
const _1 = require(".");
const Env = process.env.NODE_ENV;
if (!Env || !Object.keys(config_1.EnvConfig).includes(Env)) {
    throw new Error('Must set an environment');
}
class CoreDataService {
    // todo: we can replace the many records pointing to docs in config with a call to the drive service to get the folder
    // the constructor gets the core id which points to the core google spreadsheet by default
    // you can pass in a different id for testing purposes, but this should work in test and prod
    constructor(spreadsheetId = config_1.EnvConfig[Env].GSPREAD_CORE_ID) {
        this.driveCoreDataService = new _1.GoogleDriveService(
        // todo: this should be the core data folder
        config_1.EnvConfig[Env].GSPREAD_CORE_ID);
        this.configSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'config'
        });
        this.configMarketSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'config-market'
        });
        this.coreTypeSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'type'
        });
    }
    async getConfigByGuildId(guildId) {
        // get the market id
        const configRows = await this.configMarketSheetService.getAllRowsAsMaps();
        const marketId = configRows.find((a) => a.code === 'DISCORD_GUILD_ID')?.marketId;
        if (!marketId) {
            throw new Error(`No config found for guild ${guildId}!`);
        }
        const configRow = (await this.configMarketSheetService.getAllRowsAsMaps()).filter((row) => row.marketId === marketId);
        // build the config
        const config = { ...config_1.EnvConfig[Env] };
        for (const row of configRow) {
            config[row.code] = row.value;
        }
        // return
        return new model_1.ConfigModel(config);
    }
    async getAllGuildIds() {
        // get the market id
        const configRows = await this.configMarketSheetService.getAllRowsAsMaps();
        return configRows
            .filter((a) => a.code === 'DISCORD_GUILD_ID')
            .map((a) => a.value);
    }
}
exports.CoreDataService = CoreDataService;

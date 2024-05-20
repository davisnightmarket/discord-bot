"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreDataService = void 0;
const _1 = require(".");
const Env = process.env.NODE_ENV;
class CoreDataService {
    // todo: we can replace the many records pointing to docs in config with a call to the drive service to get the folder
    // the constructor gets the core id which points to the core google spreadsheet by default
    // you can pass in a different id for testing purposes, but this should work in test and prod
    constructor(marketConfig) {
        this.marketConfig = marketConfig;
        const spreadsheetId = marketConfig.GSPREAD_CORE_ID;
        this.driveCoreDataService = new _1.GoogleDriveService(spreadsheetId);
        this.configSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'config'
        });
        this.configMarketSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'config-market'
        });
        this.coreTypeSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'type'
        });
    }
    async getMarketConfigByGuildId(guildId) {
        // get the market id
        const configRows = await this.configMarketSheetService.getAllRowsAsMaps();
        const marketId = configRows.find((a) => a.code === 'DISCORD_GUILD_ID')?.marketId;
        if (!marketId) {
            throw new Error(`No config found for guild ${guildId}!`);
        }
        const configRow = (await this.configMarketSheetService.getAllRowsAsMaps()).filter((row) => row.marketId === marketId);
        // build the config
        const config = { ...this.marketConfig };
        for (const row of configRow) {
            config[row.code] = row.value;
        }
        // return
        return this.getValidMarketConfig(config);
    }
    getValidMarketConfig({ PG_CONFIG, GSPREAD_CORE_ID, NM_ID, DISCORD_GUILD_ID, GSPREAD_MARKET_ID }) {
        if (!GSPREAD_CORE_ID) {
            throw new Error('Missing GSPREAD_CORE_ID');
        }
        if (!NM_ID) {
            throw new Error('Missing NM_ID');
        }
        if (!DISCORD_GUILD_ID) {
            throw new Error('Missing DISCORD_GUILD_ID');
        }
        if (!GSPREAD_MARKET_ID) {
            throw new Error('Missing GSPREAD_CORE_PERSON_ID');
        }
        if (!PG_CONFIG) {
            throw new Error('Missing PG_CONFIG');
        }
        return {
            GSPREAD_CORE_ID,
            NM_ID,
            DISCORD_GUILD_ID,
            GSPREAD_MARKET_ID
        };
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
// export class MarketConfigModel implements AllMarketConfigModel {
//     // the spreadsheet id for where configuration is kept for all market instances
//     GSPREAD_CORE_ID: string;
//     // the spreadsheet id for where types are kept for all market instances
//     // GSPREAD_CORE_TYPE_ID: string;
//     // the spreadsheet id for the core data model where people and orgs are kept
//     // GSPREAD_CORE_PERSON_ID: string;
//     // // the spreadsheet id for where organizations are kept
//     // GSPREAD_CORE_ORG_ID: string;
//     // the id of the instance
//     NM_ID: string;
//     // the guild id
//     DISCORD_GUILD_ID: string;
//     // all the data are here
//     GSPREAD_MARKET_ID: string;
//     constructor({
//         PG_CONFIG,
//         GSPREAD_CORE_ID,
//         NM_ID,
//         DISCORD_GUILD_ID,
//         GSPREAD_MARKET_ID
//     }: Partial<AllMarketConfigModel>) {
//         if (!GSPREAD_CORE_ID) {
//             throw new Error('Missing GSPREAD_CORE_ID');
//         }
//         this.GSPREAD_CORE_ID = GSPREAD_CORE_ID;
//         if (!NM_ID) {
//             throw new Error('Missing NM_ID');
//         }
//         if (!DISCORD_GUILD_ID) {
//             throw new Error('Missing DISCORD_GUILD_ID');
//         }
//         if (!GSPREAD_MARKET_ID) {
//             throw new Error('Missing GSPREAD_CORE_PERSON_ID');
//         }
//         if (!PG_CONFIG) {
//             throw new Error('Missing PG_CONFIG');
//         }
//         this.NM_ID = NM_ID;
//         // adding strings to this because it is an integer id
//         this.DISCORD_GUILD_ID = DISCORD_GUILD_ID + '';
//         this.GSPREAD_MARKET_ID = GSPREAD_MARKET_ID;
//     }
// }

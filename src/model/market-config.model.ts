import { type ConnectionConfig } from 'pg';
export type EnvType = 'dev' | 'test' | 'prod';

// these config values are needed for all nm instances
export interface MarketConfigInstanceModel extends Record<string, any> {
    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // per market data is kept in a dedicated spreadsheet
    GSPREAD_MARKET_ID: string;
}

// these config values are needed for all nm instances
export interface MarketCoreConfigModel extends Record<string, any> {
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_ID: string;
    // // the spreadsheet id for where types are kept for all market instances
    // GSPREAD_CORE_TYPE_ID: string;
    // // the spreadsheet id for the core data model where people and orgs are kept
    // GSPREAD_CORE_PERSON_ID: string;
    // // the spreadsheet id for where organizations are kept
    // GSPREAD_CORE_ORG_ID: string;
}

export type MarketConfigModel = MarketCoreConfigModel &
    MarketConfigInstanceModel;

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

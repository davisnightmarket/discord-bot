export type EnvType = 'dev' | 'test' | 'prod';

// these config values are needed for all nm instances
export interface NMConfigInstanceModel extends Record<string, any> {
    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // per market data is kept in a dedicated spreadsheet
    GSPREAD_MARKET_ID: string;
}

// these config values are needed for all nm instances
export interface NMCoreConfigModel extends Record<string, any> {
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_ID: string;
    // // the spreadsheet id for where types are kept for all market instances
    // GSPREAD_CORE_TYPE_ID: string;
    // // the spreadsheet id for the core data model where people and orgs are kept
    // GSPREAD_CORE_PERSON_ID: string;
    // // the spreadsheet id for where organizations are kept
    // GSPREAD_CORE_ORG_ID: string;
}

export type NMConfigModel = NMCoreConfigModel & NMConfigInstanceModel;

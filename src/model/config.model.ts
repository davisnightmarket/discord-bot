export interface NmInstanceConfigModel {
    // the name of the config
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_OPS_ID: string;
    // the spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_CONFIG_ID: string;
    // the spreadsheet id for where types are kept for all market instances
    GSPREAD_CORE_TYPE_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_PERSON_ID: string;
    // the spreadsheet id for where organizations are kept
    GSPREAD_CORE_ORG_ID: string;
    // the spreadsheet id for where pickups are kept
    GSPREAD_CORE_PICKUPS_ID: string;
}

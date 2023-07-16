export type EnvType = 'dev' | 'test' | 'prod';

// these config values are needed for all nm instances
export interface InstanceConfigModel {
    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_OPS_ID: string;
    // the spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
}
// these config values are needed for all nm instances
export interface CoreConfigModel {
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_CONFIG_ID: string;
    // the spreadsheet id for where types are kept for all market instances
    GSPREAD_CORE_TYPE_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_PERSON_ID: string;
    // the spreadsheet id for where organizations are kept
    GSPREAD_CORE_ORG_ID: string;
}

export type AllConfigModel = CoreConfigModel & InstanceConfigModel;

export class ConfigModel implements AllConfigModel {
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_CONFIG_ID: string;
    // the spreadsheet id for where types are kept for all market instances
    GSPREAD_CORE_TYPE_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_PERSON_ID: string;
    // the spreadsheet id for where organizations are kept
    GSPREAD_CORE_ORG_ID: string;

    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_OPS_ID: string;
    // the spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;

    constructor({
        GSPREAD_CORE_CONFIG_ID,
        GSPREAD_CORE_TYPE_ID,
        GSPREAD_CORE_PERSON_ID,
        GSPREAD_CORE_ORG_ID,
        NM_ID,
        DISCORD_GUILD_ID,
        GSPREAD_OPS_ID,
        GSPREAD_FOODCOUNT_ID
    }: Partial<AllConfigModel>) {
        if (!GSPREAD_CORE_CONFIG_ID) {
            throw new Error('Missing GSPREAD_CORE_CONFIG_ID');
        }
        if (!GSPREAD_CORE_TYPE_ID) {
            throw new Error('Missing GSPREAD_CORE_TYPE_ID');
        }
        if (!GSPREAD_CORE_PERSON_ID) {
            throw new Error('Missing GSPREAD_CORE_PERSON_ID');
        }
        if (!GSPREAD_CORE_ORG_ID) {
            throw new Error('Missing GSPREAD_CORE_ORG_ID');
        }
        this.GSPREAD_CORE_CONFIG_ID = GSPREAD_CORE_CONFIG_ID;
        this.GSPREAD_CORE_TYPE_ID = GSPREAD_CORE_TYPE_ID;
        this.GSPREAD_CORE_PERSON_ID = GSPREAD_CORE_PERSON_ID;
        this.GSPREAD_CORE_ORG_ID = GSPREAD_CORE_ORG_ID;

        if (!NM_ID) {
            throw new Error('Missing NM_ID');
        }
        if (!DISCORD_GUILD_ID) {
            throw new Error('Missing DISCORD_GUILD_ID');
        }
        if (!GSPREAD_OPS_ID) {
            throw new Error('Missing GSPREAD_OPS_ID');
        }
        if (!GSPREAD_FOODCOUNT_ID) {
            throw new Error('Missing GSPREAD_FOODCOUNT_ID');
        }
        this.NM_ID = NM_ID;
        this.DISCORD_GUILD_ID = DISCORD_GUILD_ID;
        this.GSPREAD_OPS_ID = GSPREAD_OPS_ID;
        this.GSPREAD_FOODCOUNT_ID = GSPREAD_FOODCOUNT_ID;
    }
}

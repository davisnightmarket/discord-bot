export type EnvType = 'dev' | 'test' | 'prod';

// these config values are needed for all nm instances
export interface InstanceConfigModel {
    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // the spreadsheet id for where operations like pickups are kept
    GSPREAD_NIGHT_ID: string;
    GSPREAD_PERSON_ID: string;
    GSPREAD_ORG_ID: string;
    // the spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
}

// these config values are needed for all nm instances
export interface CoreConfigModel {
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_ID: string;
    // // the spreadsheet id for where types are kept for all market instances
    // GSPREAD_CORE_TYPE_ID: string;
    // // the spreadsheet id for the core data model where people and orgs are kept
    // GSPREAD_CORE_PERSON_ID: string;
    // // the spreadsheet id for where organizations are kept
    // GSPREAD_CORE_ORG_ID: string;
}

export type AllConfigModel = CoreConfigModel & InstanceConfigModel;

export class ConfigModel implements AllConfigModel {
    // the spreadsheet id for where configuration is kept for all market instances
    GSPREAD_CORE_ID: string;
    // the spreadsheet id for where types are kept for all market instances
    // GSPREAD_CORE_TYPE_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    // GSPREAD_CORE_PERSON_ID: string;
    // // the spreadsheet id for where organizations are kept
    // GSPREAD_CORE_ORG_ID: string;

    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // all the people are here
    GSPREAD_PERSON_ID: string;
    // all the orgs are here
    GSPREAD_ORG_ID: string;
    // the spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_NIGHT_ID: string;
    // the spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;

    constructor({
        GSPREAD_CORE_ID,
        NM_ID,
        DISCORD_GUILD_ID,
        GSPREAD_PERSON_ID,
        GSPREAD_ORG_ID,
        GSPREAD_NIGHT_ID,
        GSPREAD_FOODCOUNT_ID
    }: Partial<AllConfigModel>) {
        if (!GSPREAD_CORE_ID) {
            throw new Error('Missing GSPREAD_CORE_ID');
        }

        this.GSPREAD_CORE_ID = GSPREAD_CORE_ID;

        if (!NM_ID) {
            throw new Error('Missing NM_ID');
        }
        if (!DISCORD_GUILD_ID) {
            throw new Error('Missing DISCORD_GUILD_ID');
        }

        if (!GSPREAD_PERSON_ID) {
            throw new Error('Missing GSPREAD_CORE_PERSON_ID');
        }
        if (!GSPREAD_ORG_ID) {
            throw new Error('Missing GSPREAD_CORE_ORG_ID');
        }
        if (!GSPREAD_NIGHT_ID) {
            throw new Error('Missing GSPREAD_NIGHT_ID');
        }
        if (!GSPREAD_FOODCOUNT_ID) {
            throw new Error('Missing GSPREAD_FOODCOUNT_ID');
        }

        this.NM_ID = NM_ID;
        // adding strings to this because it is an integer id
        this.DISCORD_GUILD_ID = DISCORD_GUILD_ID + '';
        this.GSPREAD_ORG_ID = GSPREAD_ORG_ID;
        this.GSPREAD_PERSON_ID = GSPREAD_PERSON_ID;
        this.GSPREAD_NIGHT_ID = GSPREAD_NIGHT_ID;
        this.GSPREAD_FOODCOUNT_ID = GSPREAD_FOODCOUNT_ID;
    }
}

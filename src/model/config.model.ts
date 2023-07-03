// right now dev and test are the same
export type EnvType = 'dev' | 'test' | 'prod';

// ok, time to stub out different night markets with their own discord servers
// we will call this "Night Market Instance"

export type NMInstanceType = 'davis.nightmarket';

export interface NmConfigModel {
    // the guild id
    GUILD_ID: string;
    // the  spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_ID: string;
    // the  spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
}

export type EnvConfigModel = {
    [l in NMInstanceType]: {
        [k in EnvType]: NmConfigModel;
    };
};

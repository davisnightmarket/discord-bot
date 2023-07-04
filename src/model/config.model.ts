// right now dev and test are the same
export type EnvType = 'dev' | 'test' | 'prod';

// ok, time to stub out different night markets with their own discord servers
// we will call this "Night Market Instance"

export type NMInstanceType = 'davis.nightmarket';

// because some data docs are core
export interface NmCoreConfigModel {
    // the  spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_PERSON_ID: string;
    // the  spreadsheet id for where food counts are kept
    GSPREAD_CORE_ORG_ID: string;
    GSPREAD_CORE_CONFIG_ID: string;
}

// and some are instances
export interface NmReplicaConfigModel {
    // the guild id
    DISCORD_GUILD_ID: string;
    // the  spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_OPS_ID: string;
    // the  spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
}

export type NmConfigModel = {
    coreConfig: NmCoreConfigModel;
    replicaConfig: NmReplicaConfigModel;
};
export type EnvConfigModel = {
    [l in NMInstanceType]: {
        [k in EnvType]: {
            coreConfig: NmCoreConfigModel;
            replicaConfig: NmReplicaConfigModel;
        };
    };
};

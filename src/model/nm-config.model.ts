import { ConnectionConfig } from 'pg';
import { RPoolConnectionOptions } from 'rethinkdb-ts';

export type EnvType = 'dev' | 'test' | 'prod';

interface GoogleApiConfigModel {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}

interface DiscordApiConfigModel {
    clientId: string;
    appToken: string;
}

export interface SecretConfigModel {
    googleApiConfig: GoogleApiConfigModel;
    discordApiConfig: DiscordApiConfigModel;
    pgConfig: ConnectionConfig;
    rdbConfig: RPoolConnectionOptions;
}

// these config values are needed for all nm instances
export interface NMConfigInstanceModel {
    // the id of the instance
    NM_ID: string;
    // the guild id
    DISCORD_GUILD_ID: string;
    // per market data is kept in a dedicated spreadsheet
    GSPREAD_MARKET_ID: string;
}

// these config values are needed for all nm instances
export interface NMCoreConfigModel {
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

export interface AppConfigModel extends SecretConfigModel {
    nmConfig: NMConfigModel;
}

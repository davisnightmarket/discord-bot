import type { ConnectionConfig } from 'pg';
import type { RConnectionOptions } from 'rethinkdb-ts';

export interface GoogleApiKeysModel {
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

export interface DiscordApiKeysModel {
    clientId: string;
    appToken: string;
}

export interface PostgresApiKeysModel extends ConnectionConfig {}

export type RdbKeysModel = RConnectionOptions;

export interface NmKeysModel {
    googleApiKeys: GoogleApiKeysModel;
    discordApiKeys: DiscordApiKeysModel;
}

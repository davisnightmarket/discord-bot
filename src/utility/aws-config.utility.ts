import { join } from 'path';
import { readFileSync } from 'fs';
import { GetAwsSecret } from './aws-secrets.utility';
import { type ConnectionConfig } from 'pg';
import { GetEnv } from './env.utility';

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
}

const DISCORD_CONFIG_NAME = 'nm-discord-api';
const GOOGLE_KEYS_NAME = 'nm-google-api';
const PG_KEYS_NAME = 'nm-rds-postgres';

export async function GetAwsSecretsConfig(): Promise<SecretConfigModel> {
    // dev uses a local secret keys file
    // otherwise we use aws secrets
    if (GetEnv() !== 'dev') {
        return {
            googleApiConfig: await GetAwsSecret(GOOGLE_KEYS_NAME),
            discordApiConfig: await GetAwsSecret(DISCORD_CONFIG_NAME),
            pgConfig: await GetAwsSecret(PG_KEYS_NAME)
        };
    } else {
        return {
            googleApiConfig: JSON.parse(
                readFileSync(
                    join(__dirname, `../../${GOOGLE_KEYS_NAME}.secret.json`),
                    'utf-8'
                )
            ),
            discordApiConfig: JSON.parse(
                readFileSync(
                    join(__dirname, `../../${DISCORD_CONFIG_NAME}.secret.json`),
                    'utf-8'
                )
            ),
            pgConfig: JSON.parse(
                readFileSync(
                    join(__dirname, `../../${DISCORD_CONFIG_NAME}.secret.json`),
                    'utf-8'
                )
            )
        };
    }
}

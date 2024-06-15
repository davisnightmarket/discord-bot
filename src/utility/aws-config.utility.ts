import { join } from 'path';
import { readFileSync } from 'fs';
import { GetAwsSecret } from './aws-secrets.utility';
import { GetEnv } from './env.utility';
import type { SecretConfigModel } from '../model';

const DISCORD_CONFIG_NAME = 'nm-discord-api';
const GOOGLE_KEYS_NAME = 'nm-google-api';
const PG_KEYS_NAME = 'nm-rds-postgres';
const RDB_KEYS_NAME = 'nm-rethinkdb';

export async function GetAwsSecretsConfig(): Promise<SecretConfigModel> {
    // dev uses a local secret keys file
    // otherwise we use aws secrets
    if (GetEnv() !== 'dev') {
        return {
            googleApiConfig: await GetAwsSecret(GOOGLE_KEYS_NAME),
            discordApiConfig: await GetAwsSecret(DISCORD_CONFIG_NAME),
            pgConfig: await GetAwsSecret(PG_KEYS_NAME),
            rdbConfig: await GetAwsSecret(RDB_KEYS_NAME)
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
                    join(__dirname, `../../${PG_KEYS_NAME}.secret.json`),
                    'utf-8'
                )
            ),
            rdbConfig: JSON.parse(
                readFileSync(
                    join(__dirname, `../../${RDB_KEYS_NAME}.secret.json`),
                    'utf-8'
                )
            )
        };
    }
}

import { GetGoogleSecrets } from './google-secrets.utility';
import { join } from 'path';
import { readFileSync } from 'fs';

interface GoogleSpreadsheetsKeysModel {
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

interface DiscordKeysModel {
    appId: string;
    appToken: string;
}

export interface NmKeysModel {
    googleSpreadsheetsKeys: GoogleSpreadsheetsKeysModel;
    discordConfig: DiscordKeysModel;
}

const DISCORD_CONFIG_NAME = 'config-discord-api';
const GOOGLE_KEYS_NAME = 'config-google-api';

export async function GetNmSecrets(): Promise<NmKeysModel> {
    if (process.env.NODE_ENV === 'prod') {
        return {
            googleSpreadsheetsKeys:
                await GetGoogleSecrets<GoogleSpreadsheetsKeysModel>(
                    `nm-${GOOGLE_KEYS_NAME}`
                ),
            discordConfig: await GetGoogleSecrets<DiscordKeysModel>(
                `nm-${DISCORD_CONFIG_NAME}`
            )
        };
    } else {
        return {
            googleSpreadsheetsKeys: JSON.parse(
                readFileSync(
                    join(__dirname, `../../${GOOGLE_KEYS_NAME}.keys.json`),
                    'utf-8'
                )
            ),
            discordConfig: JSON.parse(
                readFileSync(
                    join(__dirname, `../../${DISCORD_CONFIG_NAME}.keys.json`),
                    'utf-8'
                )
            )
        };
    }
}

export const NmSecrets = GetNmSecrets();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAwsSecretsConfig = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const aws_secrets_utility_1 = require("./aws-secrets.utility");
const env_utility_1 = require("./env.utility");
const DISCORD_CONFIG_NAME = 'nm-discord-api';
const GOOGLE_KEYS_NAME = 'nm-google-api';
const PG_KEYS_NAME = 'nm-rds-postgres';
async function GetAwsSecretsConfig() {
    // dev uses a local secret keys file
    // otherwise we use aws secrets
    if ((0, env_utility_1.GetEnv)() !== 'dev') {
        return {
            googleApiConfig: await (0, aws_secrets_utility_1.GetAwsSecret)(GOOGLE_KEYS_NAME),
            discordApiConfig: await (0, aws_secrets_utility_1.GetAwsSecret)(DISCORD_CONFIG_NAME),
            pgConfig: await (0, aws_secrets_utility_1.GetAwsSecret)(PG_KEYS_NAME)
        };
    }
    else {
        return {
            googleApiConfig: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${GOOGLE_KEYS_NAME}.secret.json`), 'utf-8')),
            discordApiConfig: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${DISCORD_CONFIG_NAME}.secret.json`), 'utf-8')),
            pgConfig: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${DISCORD_CONFIG_NAME}.secret.json`), 'utf-8'))
        };
    }
}
exports.GetAwsSecretsConfig = GetAwsSecretsConfig;

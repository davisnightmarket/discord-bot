"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmSecrets = exports.GetNmSecrets = void 0;
const google_secrets_utility_1 = require("./google-secrets.utility");
const path_1 = require("path");
const fs_1 = require("fs");
const DISCORD_CONFIG_NAME = 'config-discord-api';
const GOOGLE_KEYS_NAME = 'config-google-api';
async function GetNmSecrets() {
    if (process.env.NODE_ENV === 'prod') {
        return {
            googleSpreadsheetsKeys: await (0, google_secrets_utility_1.GetGoogleSecrets)(`nm-${GOOGLE_KEYS_NAME}`),
            discordConfig: await (0, google_secrets_utility_1.GetGoogleSecrets)(`nm-${DISCORD_CONFIG_NAME}`)
        };
    }
    else {
        return {
            googleSpreadsheetsKeys: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${GOOGLE_KEYS_NAME}.keys.json`), 'utf-8')),
            discordConfig: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${DISCORD_CONFIG_NAME}.keys.json`), 'utf-8'))
        };
    }
}
exports.GetNmSecrets = GetNmSecrets;
exports.NmSecrets = GetNmSecrets();

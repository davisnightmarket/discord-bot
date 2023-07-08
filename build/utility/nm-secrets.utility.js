"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNmSecrets = void 0;
const google_secrets_utility_1 = require("./google-secrets.utility");
const path_1 = require("path");
const fs_1 = require("fs");
const DISCORD_CONFIG_NAME = 'config-discord-api';
const GOOGLE_KEYS_NAME = 'config-google-api';
function GetNmSecrets() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.NODE_ENV === 'prod') {
            return {
                googleSpreadsheetsKeys: yield (0, google_secrets_utility_1.GetGoogleSecrets)(`nm-${GOOGLE_KEYS_NAME}`),
                discordConfig: yield (0, google_secrets_utility_1.GetGoogleSecrets)(`nm-${DISCORD_CONFIG_NAME}`)
            };
        }
        else {
            return {
                googleSpreadsheetsKeys: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${GOOGLE_KEYS_NAME}.keys.json`), 'utf-8')),
                discordConfig: JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${DISCORD_CONFIG_NAME}.keys.json`), 'utf-8'))
            };
        }
    });
}
exports.GetNmSecrets = GetNmSecrets;

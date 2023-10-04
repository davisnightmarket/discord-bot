"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModel = void 0;
class ConfigModel {
    constructor({ GSPREAD_CORE_CONFIG_ID, GSPREAD_CORE_TYPE_ID, GSPREAD_CORE_PERSON_ID, GSPREAD_CORE_ORG_ID, NM_ID, DISCORD_GUILD_ID, GSPREAD_OPS_ID, GSPREAD_FOODCOUNT_ID }) {
        if (!GSPREAD_CORE_CONFIG_ID) {
            throw new Error('Missing GSPREAD_CORE_CONFIG_ID');
        }
        if (!GSPREAD_CORE_TYPE_ID) {
            throw new Error('Missing GSPREAD_CORE_TYPE_ID');
        }
        if (!GSPREAD_CORE_PERSON_ID) {
            throw new Error('Missing GSPREAD_CORE_PERSON_ID');
        }
        if (!GSPREAD_CORE_ORG_ID) {
            throw new Error('Missing GSPREAD_CORE_ORG_ID');
        }
        this.GSPREAD_CORE_CONFIG_ID = GSPREAD_CORE_CONFIG_ID;
        this.GSPREAD_CORE_TYPE_ID = GSPREAD_CORE_TYPE_ID;
        this.GSPREAD_CORE_PERSON_ID = GSPREAD_CORE_PERSON_ID;
        this.GSPREAD_CORE_ORG_ID = GSPREAD_CORE_ORG_ID;
        if (!NM_ID) {
            throw new Error('Missing NM_ID');
        }
        if (!DISCORD_GUILD_ID) {
            throw new Error('Missing DISCORD_GUILD_ID');
        }
        if (!GSPREAD_OPS_ID) {
            throw new Error('Missing GSPREAD_OPS_ID');
        }
        if (!GSPREAD_FOODCOUNT_ID) {
            throw new Error('Missing GSPREAD_FOODCOUNT_ID');
        }
        this.NM_ID = NM_ID;
        // adding strings to this because it is an integer id
        this.DISCORD_GUILD_ID = DISCORD_GUILD_ID + '';
        this.GSPREAD_OPS_ID = GSPREAD_OPS_ID;
        this.GSPREAD_FOODCOUNT_ID = GSPREAD_FOODCOUNT_ID;
    }
}
exports.ConfigModel = ConfigModel;

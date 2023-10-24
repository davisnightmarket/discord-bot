"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModel = void 0;
class ConfigModel {
    constructor({ GSPREAD_CORE_ID, NM_ID, DISCORD_GUILD_ID, GSPREAD_MARKET_ID }) {
        if (!GSPREAD_CORE_ID) {
            throw new Error('Missing GSPREAD_CORE_ID');
        }
        this.GSPREAD_CORE_ID = GSPREAD_CORE_ID;
        if (!NM_ID) {
            throw new Error('Missing NM_ID');
        }
        if (!DISCORD_GUILD_ID) {
            throw new Error('Missing DISCORD_GUILD_ID');
        }
        if (!GSPREAD_MARKET_ID) {
            throw new Error('Missing GSPREAD_CORE_PERSON_ID');
        }
        this.NM_ID = NM_ID;
        // adding strings to this because it is an integer id
        this.DISCORD_GUILD_ID = DISCORD_GUILD_ID + '';
        this.GSPREAD_MARKET_ID = GSPREAD_MARKET_ID;
    }
}
exports.ConfigModel = ConfigModel;

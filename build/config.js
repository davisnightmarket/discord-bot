"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.ConfigLocal = exports.EnvConfigLocal = exports.InstanceConfig = void 0;
const config_utility_1 = require("./utility/config.utility");
// these come from the config spreadsheet, used here as placeholders
exports.InstanceConfig = {
    GSPREAD_CORE_ID: '',
    // identifies each Night Market instance with a human readable code, ie: davis.ca.usa
    NM_ID: '',
    // comes from discord, the unique id of the guild that is associated with the market
    DISCORD_GUILD_ID: '',
    // each market gets a dedicated spreadsheet for their data
    GSPREAD_MARKET_ID: ''
};
// core marketConfig property GSPREAD_CORE_ID is stored in
// the local codebase because it bootstraps our core data service
exports.EnvConfigLocal = {
    test: {
        marketConfig: {
            ...exports.InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    dev: {
        marketConfig: {
            ...exports.InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    prod: {
        marketConfig: {
            ...exports.InstanceConfig,
            GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M'
        }
    }
};
exports.ConfigLocal = exports.EnvConfigLocal[process.env.NODE_ENV];
// we call GetConfig once and then import the promise anywhere we need config
exports.Config = (0, config_utility_1.GetConfig)(process.env.NODE_ENV, exports.EnvConfigLocal);

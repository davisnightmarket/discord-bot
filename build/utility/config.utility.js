"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingForConfig = exports.ConfigLocal = exports.InstanceConfig = exports.GetConfig = void 0;
const _1 = require(".");
const waitingForAwsSecrets = (0, _1.GetAwsSecretsConfig)();
const GetConfig = async (env = (0, _1.GetEnv)(), envConfig) => {
    // get our local environment config
    const config = envConfig[env];
    const secretConfig = await waitingForAwsSecrets;
    // combined with our config from secrets
    return { ...config, ...secretConfig };
};
exports.GetConfig = GetConfig;
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
const EnvConfig = {
    test: {
        nmConfig: {
            ...exports.InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    dev: {
        nmConfig: {
            ...exports.InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    prod: {
        nmConfig: {
            ...exports.InstanceConfig,
            GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M'
        }
    }
};
exports.ConfigLocal = EnvConfig[process.env.NODE_ENV];
// we call GetConfig once and then import the promise anywhere we need config
exports.WaitingForConfig = (0, exports.GetConfig)((0, _1.GetEnv)(), EnvConfig);

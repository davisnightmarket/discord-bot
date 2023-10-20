"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfig = exports.InstanceConfig = void 0;
// these come from the config spreadsheet, used here as placeholders
exports.InstanceConfig = {
    NM_ID: '',
    DISCORD_GUILD_ID: '',
    GSPREAD_FOODCOUNT_ID: '',
    GSPREAD_NIGHT_ID: '',
    GSPREAD_PERSON_ID: '',
    GSPREAD_ORG_ID: ''
};
const coreConfig = {
    // GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
    // GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
    // types are lists of strings or numbers with specific uses
    GSPREAD_CORE_ID: ''
};
// important: the "core" goog spreadsheet ids are hard coded since there is only ever one of them
// the instance ones are defined in the core one, so you have to await those with the Config Utility
exports.EnvConfig = {
    test: {
        ...coreConfig,
        ...exports.InstanceConfig,
        // this is the spreadsheet that bootstraps all else
        GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        // NM_ID: 'TEST.usa.ca.davis',
        // DISCORD_GUILD_ID: '1094663742559625367',
        // GSPREAD_FOODCOUNT_ID: '1DPPmJU1w34PEWB3XZKeIBA0Qc7nx3R2xiJFwDbTxeNk',
        // GSPREAD_OPS_ID: '1bTt7dVKTTMY7iMNcxY0-X2Ulkw7B5p-_lmwMTDgyGP4',
        // GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
        // GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
        // GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
        // GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M'
    },
    dev: {
        ...coreConfig,
        ...exports.InstanceConfig,
        // this is the spreadsheet that bootstraps all else
        GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        // GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
        // GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
        // GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
        // GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M',
        // ...InstanceConfig
    },
    prod: {
        ...coreConfig,
        ...exports.InstanceConfig,
        // this is the spreadsheet that bootstraps all else
        GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M'
    }
};

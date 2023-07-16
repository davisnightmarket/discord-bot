"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfig = exports.InstanceConfig = void 0;
exports.InstanceConfig = {
    // these come from the config spreadsheet, used here as placeholders
    NM_ID: '',
    DISCORD_GUILD_ID: '',
    GSPREAD_FOODCOUNT_ID: '',
    GSPREAD_OPS_ID: ''
};
exports.EnvConfig = {
    dev: Object.assign({ GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM', GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI', GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0', GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M' }, exports.InstanceConfig),
    test: Object.assign({ GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM', GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI', GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0', GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M' }, exports.InstanceConfig),
    prod: Object.assign({ GSPREAD_CORE_PERSON_ID: '', GSPREAD_CORE_ORG_ID: '', GSPREAD_CORE_CONFIG_ID: '', GSPREAD_CORE_TYPE_ID: '' }, exports.InstanceConfig)
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfig = void 0;
const DevSheets = {
    GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
    GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
    GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
    GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M',
};
const ProdSheets = {
    GSPREAD_CORE_PERSON_ID: '',
    GSPREAD_CORE_ORG_ID: '',
    GSPREAD_CORE_CONFIG_ID: '',
    GSPREAD_CORE_TYPE_ID: '',
};
exports.EnvConfig = [
    Object.assign({ DISCORD_GUILD_ID: '', GSPREAD_OPS_ID: '', GSPREAD_FOODCOUNT_ID: '16aa-OL6mNZfxqZFIfjfF_hFuSjPSkevUqm7qx3v_vXE' }, ProdSheets),
    Object.assign({ DISCORD_GUILD_ID: '1094663742559625367', GSPREAD_OPS_ID: '1bTt7dVKTTMY7iMNcxY0-X2Ulkw7B5p-_lmwMTDgyGP4', GSPREAD_FOODCOUNT_ID: '1DPPmJU1w34PEWB3XZKeIBA0Qc7nx3R2xiJFwDbTxeNk' }, DevSheets),
    Object.assign({ DISCORD_GUILD_ID: '##TEST##', GSPREAD_OPS_ID: '1bTt7dVKTTMY7iMNcxY0-X2Ulkw7B5p-_lmwMTDgyGP4', GSPREAD_FOODCOUNT_ID: '1DPPmJU1w34PEWB3XZKeIBA0Qc7nx3R2xiJFwDbTxeNk' }, DevSheets),
];

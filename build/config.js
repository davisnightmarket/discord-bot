"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfig = void 0;
// TODO: this config we may want to keep in a Core Config spreadsheet
exports.EnvConfig = {
    dev: {
        coreConfig: {
            GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
            GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
            GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
            GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M'
        },
        'davis.nightmarket': {
            NM_ID: 'davis.nightmarket',
            DISCORD_GUILD_ID: '',
            GSPREAD_OPS_ID: '1bTt7dVKTTMY7iMNcxY0-X2Ulkw7B5p-_lmwMTDgyGP4',
            GSPREAD_FOODCOUNT_ID: '1DPPmJU1w34PEWB3XZKeIBA0Qc7nx3R2xiJFwDbTxeNk'
        }
    },
    // these point to TEST data in night-tech folder
    test: {
        coreConfig: {
            GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
            GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
            GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
            GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M'
        },
        'davis.nightmarket': {
            NM_ID: 'davis.nightmarket',
            DISCORD_GUILD_ID: '',
            GSPREAD_OPS_ID: '1bTt7dVKTTMY7iMNcxY0-X2Ulkw7B5p-_lmwMTDgyGP4',
            GSPREAD_FOODCOUNT_ID: '1DPPmJU1w34PEWB3XZKeIBA0Qc7nx3R2xiJFwDbTxeNk'
        }
    },
    prod: {
        coreConfig: {
            GSPREAD_CORE_PERSON_ID: '',
            GSPREAD_CORE_ORG_ID: '',
            GSPREAD_CORE_CONFIG_ID: '',
            GSPREAD_CORE_TYPE_ID: ''
        },
        'davis.nightmarket': {
            NM_ID: 'davis.nightmarket',
            DISCORD_GUILD_ID: '',
            GSPREAD_OPS_ID: '',
            GSPREAD_FOODCOUNT_ID: '16aa-OL6mNZfxqZFIfjfF_hFuSjPSkevUqm7qx3v_vXE'
        }
    }
};

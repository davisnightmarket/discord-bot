import type { ConfigModel, EnvType } from './model/config.model';

// these come from the config spreadsheet, used here as placeholders
export const InstanceConfig = {
    NM_ID: '',
    DISCORD_GUILD_ID: '',
    GSPREAD_FOODCOUNT_ID: '',
    GSPREAD_OPS_ID: '',
    GSPREAD_CORE_PICKUPS_ID: '',
};

export const EnvConfig: Record<EnvType, ConfigModel> = {
    test: {
        NM_ID: "##TEST##",
        DISCORD_GUILD_ID: '##TEST##',
        GSPREAD_FOODCOUNT_ID: '1DPPmJU1w34PEWB3XZKeIBA0Qc7nx3R2xiJFwDbTxeNk',
        GSPREAD_OPS_ID: '1bTt7dVKTTMY7iMNcxY0-X2Ulkw7B5p-_lmwMTDgyGP4',
        GSPREAD_CORE_PICKUPS_ID: '1aPaHi5LJ1UB0terT4Tc0XuFE4IIYzjai6d5TM8rtWBQ',
        GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
        GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
        GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
        GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M',
    },
    dev: {
        GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
        GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
        GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
        GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M',
        ...InstanceConfig
    },
    prod: {
        GSPREAD_CORE_PERSON_ID: '',
        GSPREAD_CORE_ORG_ID: '',
        GSPREAD_CORE_CONFIG_ID: '',
        GSPREAD_CORE_TYPE_ID: '',
        ...InstanceConfig
    }
};

import type {
    AllConfigModel,
    EnvType,
    InstanceConfigModel
} from './model/config.model';

export const InstanceConfig: InstanceConfigModel = {
    // these come from the config spreadsheet, used here as placeholders
    NM_ID: '',
    DISCORD_GUILD_ID: '',
    GSPREAD_FOODCOUNT_ID: '',
    GSPREAD_OPS_ID: ''
};

export const EnvConfig: {
    [k in EnvType]: AllConfigModel;
} = {
    dev: {
        GSPREAD_CORE_PERSON_ID: '1X5fJDmGKJtbAanHOqyQ3RCHMP63ABQK4fgpvzm9RSLM',
        GSPREAD_CORE_ORG_ID: '1Y1RerSbgdrVcwocvCjWo8SyxutLr7BLiuJnUJlajodI',
        GSPREAD_CORE_TYPE_ID: '1MW2utNJZcuJad2LC57D5DDTx_S_Q0iXYNg7XwlzPcx0',
        GSPREAD_CORE_CONFIG_ID: '1rPyY8Gn7lA59GLLMAQOtCeW47zi5gA2elVcv0zMp-2M',
        ...InstanceConfig
    },
    test: {
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

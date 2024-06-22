import type { AppConfigModel, EnvType, NMConfigModel } from './model';

// these come from the config spreadsheet, used here as placeholders
export const InstanceConfig: NMConfigModel = {
    GSPREAD_CORE_ID: '',
    // identifies each Night Market instance with a human readable code, ie: davis.ca.usa
    NM_ID: '',
    NM_TIMEZONE: '',
    NM_TITLE: '',
    // comes from discord, the unique id of the guild that is associated with the market
    NM_DISCORD_GUILD_ID: '',
    // each market gets a dedicated spreadsheet for their data
    NM_INSTANCE_GSPREAD_ID: '',
    // this is the core constitituion - it can be overridden per market
    NM_CONSTITUTION_GDRIVE_ID: '1ypTB552HxIGvLaLV2cOZskbvKA6GXWkt',
    // the default folder for markdown, which holds messages from crabapple to folks
    NM_MARKDOWN_FOLDER_ID: '1TVadoq8HFSoNKnlP9l4YSiDIbGwSBOri'
};

// core marketConfig property GSPREAD_CORE_ID is stored in
// the local codebase because it bootstraps our core data service
// which is where specific config data is stored, ie discord guild id and market
export const EnvConfig: Record<EnvType, Pick<AppConfigModel, 'nmConfig'>> = {
    test: {
        nmConfig: {
            ...InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    dev: {
        nmConfig: {
            ...InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    prod: {
        nmConfig: {
            ...InstanceConfig,
            GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M'
        }
    }
};

import { AppConfigModel, EnvType, NMConfigModel } from './model';

// these come from the config spreadsheet, used here as placeholders
export const InstanceConfig: NMConfigModel = {
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

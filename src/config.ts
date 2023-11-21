import type { ConfigModel, EnvType } from './model/config.model';

// these come from the config spreadsheet, used here as placeholders
export const InstanceConfig = {
    // identifies each Night Market instance with a human readable code, ie: davis.ca.usa
    NM_ID: '',
    // comes from discord, the unique id of the guild that is associated with the market
    DISCORD_GUILD_ID: '',
    // each market gets a dedicated spreadsheet for their data
    GSPREAD_MARKET_ID: ''
};

// important: the "core" goog spreadsheet ids are hard coded since there is only ever one of them
// the instance ones are defined in the core one, so you have to await those with the Config Utility

const coreProdConfig = {
    GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M'
};

const coreTestConfig = {
    GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
};

export const EnvConfig: Record<EnvType, ConfigModel> = {
    test: {
        // use test config
        ...coreTestConfig,
        ...InstanceConfig
    },
    dev: {
        // use test config (for now)
        ...coreTestConfig,
        ...InstanceConfig
    },
    prod: {
        // use prod config
        ...coreProdConfig,
        ...InstanceConfig
    }
};

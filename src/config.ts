import { type EnvType, type MarketConfigModel } from './model';
import { type ConfigModel, GetConfig } from './utility/config-utility';

// these come from the config spreadsheet, used here as placeholders
export const InstanceConfig: MarketConfigModel = {
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
export const EnvConfigLocal: Record<
    EnvType,
    Pick<ConfigModel, 'marketConfig'>
> = {
    test: {
        marketConfig: {
            ...InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    dev: {
        marketConfig: {
            ...InstanceConfig,
            GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg'
        }
    },
    prod: {
        marketConfig: {
            ...InstanceConfig,
            GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M'
        }
    }
};

export const ConfigLocal = EnvConfigLocal[process.env.NODE_ENV as EnvType];

// we call GetConfig once and then import the promise anywhere we need config

export const Config = GetConfig(
    process.env.NODE_ENV as EnvType,
    EnvConfigLocal
);

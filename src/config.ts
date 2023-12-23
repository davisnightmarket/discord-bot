import { type ConnectionConfig } from 'pg';
import type { EnvType, MarketConfigModel } from './model/market-config.model';
import { GetConfig } from './utility';

interface ConfigModel extends Record<string, any> {
    pgConfig: ConnectionConfig;
    marketConfig: MarketConfigModel;
}

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

const pgConfig: ConnectionConfig = {
    host: 'eco-free.cyfdn3lqzhyk.us-west-1.rds.amazonaws.com',
    user: 'postgres',
    password: ''
};

const coreProdConfig: ConfigModel = {
    pgConfig,
    marketConfig: {
        GSPREAD_CORE_ID: '1hJktYzxM10wQMggY4vUVfv-SuQ1YRUWok5y75ojC91M',
        ...InstanceConfig
    }
};

const coreTestConfig: ConfigModel = {
    pgConfig,
    marketConfig: {
        GSPREAD_CORE_ID: '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg',
        ...InstanceConfig
    }
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

export const Config = GetConfig<
    {
        PG_PASSWORD: string;
    },
    ConfigModel
>(({ PG_PASSWORD }) => {
    // get our environment config
    const config = EnvConfig[process.env.NODE_ENV as EnvType];
    config.pgConfig.password = PG_PASSWORD;
    return config;
});

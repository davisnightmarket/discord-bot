import type { EnvType, NMConfigModel } from '../model/nm-config.model';
import { GetAwsSecretsConfig, GetEnv, type SecretConfigModel } from '.';

const waitingForAwsSecrets = GetAwsSecretsConfig();

export interface ConfigModel extends SecretConfigModel {
    nmConfig: NMConfigModel;
}
export const GetConfig = async (
    env: EnvType = GetEnv(),
    envConfig: Record<EnvType, Pick<ConfigModel, 'nmConfig'>>
): Promise<ConfigModel> => {
    // get our local environment config
    const config = envConfig[env];
    const secretConfig = await waitingForAwsSecrets;

    // combined with our config from secrets
    return { ...config, ...secretConfig };
};

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
const EnvConfig: Record<EnvType, Pick<ConfigModel, 'nmConfig'>> = {
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

export const ConfigLocal = EnvConfig[process.env.NODE_ENV as EnvType];

// we call GetConfig once and then import the promise anywhere we need config

export const WaitingForConfig = GetConfig(GetEnv(), EnvConfig);

import type { AppConfigModel, EnvType } from '../model';
import { GetAwsSecretsConfig, GetEnv } from '.';
import { EnvConfig } from '../config';

const waitingForAwsSecrets = GetAwsSecretsConfig();

export const GetConfig = async (
    env: EnvType = GetEnv(),
    envConfig: Record<EnvType, Pick<AppConfigModel, 'nmConfig'>>
): Promise<AppConfigModel> => {
    // get our local environment config
    const config = envConfig[env];
    const secretConfig = await waitingForAwsSecrets;

    // combined with our config from secrets
    return { ...config, ...secretConfig };
};

export const ConfigLocal = EnvConfig[GetEnv()];

// we call GetConfig once and then import the promise anywhere we need config

export const WaitingForConfig = GetConfig(GetEnv(), EnvConfig);

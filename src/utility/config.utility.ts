import {
    EnvType,
    NmInstanceType,
    NmConfigModel,
    NmCoreConfigModel,
    NmInstanceConfigModel
} from '../model/config.model';
import { EnvConfig } from '../config';
// TODO: move this to google spread so we can add new discord servers in via spreadsheet?

export let Env: EnvType = (process.env.NODE_ENV as EnvType) ?? 'test';

if (!['dev', 'test', 'prod'].includes(Env)) {
    Env = 'test';
    console.log('No Environment set, using "test"');
}

export const ConfigGet = async (
    // allow a string to be passed for night market instance
    inst: NmInstanceType,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<NmConfigModel> => ({
    coreConfig: EnvConfig[env].coreConfig,
    instanceConfig: EnvConfig[env][inst]
});

export const ConfigCoreGet = async (
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<NmCoreConfigModel> => EnvConfig[env].coreConfig;

export const ConfigCoreValueGet = async (
    // allow a string to be passed for night market instance
    inst: NmInstanceType,
    // get a string value
    a: keyof NmCoreConfigModel,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<string> => {
    const config = await ConfigGet(inst, env);
    return config.coreConfig[a];
};
export const ConfigInstanceValueGet = async (
    // allow a string to be passed for night market instance
    inst: NmInstanceType,
    // get a string value
    a: keyof NmInstanceConfigModel,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<string> => {
    const config = await ConfigGet(inst, env);
    return config.instanceConfig[a];
};

export const ConfigInstanceIdByGuildIdGet = async (
    guildId: string
): Promise<NmInstanceType | undefined> => {
    return Object.keys(EnvConfig)
        .filter(
            (a) =>
                EnvConfig[Env][a as NmInstanceType].DISCORD_GUILD_ID === guildId
        )
        .pop() as NmInstanceType;
};

export const ConfigInstanceByGuildIdGet = async (
    guildId: string
): Promise<NmInstanceConfigModel> => {
    return Object.keys(EnvConfig)
        .filter(
            (a) =>
                EnvConfig[Env][a as NmInstanceType].DISCORD_GUILD_ID === guildId
        )
        .map((a) => EnvConfig[Env][a as NmInstanceType])
        .pop() as NmInstanceConfigModel;
};

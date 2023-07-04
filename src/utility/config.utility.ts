import {
    EnvType,
    NMInstanceType,
    NmConfigModel,
    NmCoreConfigModel,
    NmReplicaConfigModel
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
    inst: NMInstanceType,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<NmConfigModel> => EnvConfig[inst][env];

export const ConfigCoreValueGet = async (
    // allow a string to be passed for night market instance
    inst: NMInstanceType,
    // get a string value
    a: keyof NmCoreConfigModel,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<string> => {
    const config = await ConfigGet(inst, env);
    return config.coreConfig[a];
};
export const ConfigReplicaValueGet = async (
    // allow a string to be passed for night market instance
    inst: NMInstanceType,
    // get a string value
    a: keyof NmReplicaConfigModel,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<string> => {
    const config = await ConfigGet(inst, env);
    return config.replicaConfig[a];
};

export const ConfigReplicaIdByGuildIdGet = (
    guildId: string
): NMInstanceType | undefined => {
    return Object.keys(EnvConfig)
        .filter(
            (a) =>
                EnvConfig[a as NMInstanceType][Env].replicaConfig
                    .DISCORD_GUILD_ID === guildId
        )
        .pop() as NMInstanceType;
};

export const ConfigByGuildIdGet = (guildId: string): NmConfigModel => {
    return Object.keys(EnvConfig)
        .filter(
            (a) =>
                EnvConfig[a as NMInstanceType][Env].replicaConfig
                    .DISCORD_GUILD_ID === guildId
        )
        .map((a) => EnvConfig[a as NMInstanceType][Env])
        .pop() as NmConfigModel;
};

import { NmInstanceConfigModel } from '../model/config.model';
import { EnvConfig } from '../config';

export const ConfigInstanceByGuildIdGet = (
    id: string
): NmInstanceConfigModel | undefined => {
    return EnvConfig.find((config) => config.DISCORD_GUILD_ID === id);
};

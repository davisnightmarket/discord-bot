import type { InstanceConfigModel, EnvType } from '../model';
import { ConfigModel } from '../model';
import { EnvConfig } from '../config';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService
} from '../nm-service';
import { GoogleSpreadsheetsService } from '../service/google-spreadsheets.service';

const Env = process.env.NODE_ENV as EnvType;

if (!Env || !Object.keys(EnvConfig).includes(Env)) {
    throw new Error('');
}

type InstanceConfigMapModel = {
    [k in string]: Partial<InstanceConfigModel>;
};

export const GetInstanceConfigMap = async () =>
    await GoogleSpreadsheetsService.create(
        EnvConfig[Env].GSPREAD_CORE_CONFIG_ID
    )
        .rangeGet('config-instance!A2:C')
        .then((configList) =>
            configList.reduce<InstanceConfigMapModel>((a, b) => {
                // here we are using config from a range that looks like:
                // nm_id, key, value
                if (!a[b[0]]) {
                    a[b[0]] = {
                        NM_ID: b[0]
                    };
                }
                a[b[0]][b[1] as keyof InstanceConfigModel] = b[2];
                return a;
            }, {})
        );

export const GetConfigInstanceByGuildId = async (
    guildId: string
): Promise<ConfigModel> => {
    const instanceConfigList = Object.values(await GetInstanceConfigMap());

    const a =
        instanceConfigList.find((a) => a.DISCORD_GUILD_ID === guildId) ?? {};
    return new ConfigModel({
        ...EnvConfig[Env],
        ...a
    });
};

export async function GetInstanceServicesByGuildId(guildId: string) {
    const config = await GetConfigInstanceByGuildId(guildId);

    const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);

    return {
        foodCountDataService: new NmFoodCountDataService(
            config.GSPREAD_FOODCOUNT_ID
        ),
        foodCountInputService: new NmFoodCountInputService(orgCoreService),
        personCoreService: new NmPersonDataService(
            config.GSPREAD_CORE_PERSON_ID
        ),
        orgCoreService
    };
}

import { type NmInstanceConfigModel } from '../model/config.model';
import { EnvConfig } from '../config';
import { NmFoodCountDataService, NmFoodCountInputService, NmOrgService, NmPersonService } from '../nm-service';

export const ConfigInstanceByGuildIdGet = (
    id: string
): NmInstanceConfigModel | undefined => {
    return EnvConfig.find((config) => config.DISCORD_GUILD_ID === id);
};

export function InitInstanceServices(config: NmInstanceConfigModel) {
    const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);

    return {
        foodCountDataService: new NmFoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
        foodCountInputService: new NmFoodCountInputService(orgCoreService),
        personCoreService: new NmPersonService(config.GSPREAD_CORE_PERSON_ID),
        orgCoreService,
    };
}

import { GetConfigByGuildId } from '../utility';
import { type GuildServiceModel, type ConfigModel } from '../model';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmNightDataService
} from '../service';

const servicesByGuildId = new Map<
    string,
    GuildServiceModel & {
        // also return the config so we can test it
        config: ConfigModel;
    }
>();

// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
export async function GetGuildServices(guildId: string) {
    if (!servicesByGuildId.has(guildId)) {
        const config = await GetConfigByGuildId(guildId);

        const orgCoreService = new NmOrgService(config.GSPREAD_ORG_ID);
        const personCoreService = new NmPersonDataService(
            config.GSPREAD_PERSON_ID
        );
        servicesByGuildId.set(guildId, {
            config,
            nightDataService: new NmNightDataService(
                config.GSPREAD_NIGHT_ID,
                personCoreService
            ),
            foodCountDataService: new NmFoodCountDataService(
                config.GSPREAD_FOODCOUNT_ID
            ),
            foodCountInputService: new NmFoodCountInputService(orgCoreService),
            personCoreService,
            orgCoreService
        });
    }

    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId) as GuildServiceModel;
}

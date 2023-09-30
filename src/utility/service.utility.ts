import { GetConfigByGuildId } from '../utility';
import { EnvConfig } from '../config';
import { type GuildServiceModel, ConfigModel, type EnvType } from '../model';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmOpsDataService
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

        const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);
        const personCoreService = new NmPersonDataService(
            config.GSPREAD_CORE_PERSON_ID
        );
        servicesByGuildId.set(guildId, {
            config,
            opsDataService: new NmOpsDataService(
                config.GSPREAD_OPS_ID,
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

import { type GuildServiceModel, type ConfigModel } from '../model';
import {
    CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    PersonDataService,
    NightDataService
} from '../service';

const coreDataService = new CoreDataService();

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
        const config = await coreDataService.getConfigByGuildId(guildId);
        const orgDataService = new OrgDataService(config.GSPREAD_ORG_ID);
        const personDataService = new PersonDataService(
            config.GSPREAD_PERSON_ID
        );
        servicesByGuildId.set(guildId, {
            config,
            coreDataService,
            nightDataService: new NightDataService(
                config.GSPREAD_NIGHT_ID,
                personDataService
            ),
            foodCountDataService: new FoodCountDataService(
                config.GSPREAD_FOODCOUNT_ID
            ),
            foodCountInputService: new FoodCountInputService(orgDataService),
            personDataService,
            orgDataService
        });
    }

    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId) as GuildServiceModel;
}

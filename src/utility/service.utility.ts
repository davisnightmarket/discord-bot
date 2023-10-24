import { type ConfigModel } from '../model';
import {
    CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    MarketAdminService,
    PersonDataService,
    NightDataService,
    MarkdownService
} from '../service';

const coreDataService = new CoreDataService();

const servicesByGuildId = new Map<
    string,
    GuildServiceModel & {
        // also return the config so we can test it
        config: ConfigModel;
    }
>();

export interface GuildServiceModel {
    coreDataService: CoreDataService;
    foodCountDataService: FoodCountDataService;
    foodCountInputService: FoodCountInputService;
    orgDataService: OrgDataService;
    personDataService: PersonDataService;
    nightDataService: NightDataService;
    markdownService: MarkdownService;
    marketAdminService: MarketAdminService;
}

// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
export async function GetGuildServices(guildId: string) {
    if (!servicesByGuildId.has(guildId)) {
        const config = await coreDataService.getConfigByGuildId(guildId);

        const orgDataService = new OrgDataService(config.GSPREAD_MARKET_ID);

        const personDataService = new PersonDataService(
            config.GSPREAD_MARKET_ID
        );

        const nightDataService = new NightDataService(
            config.GSPREAD_MARKET_ID,
            personDataService
        );

        const markdownService = new MarkdownService(coreDataService);

        const marketAdminService = new MarketAdminService(
            config.GSPREAD_MARKET_ID,
            personDataService
        );

        servicesByGuildId.set(guildId, {
            config,
            markdownService,
            coreDataService,
            nightDataService,
            foodCountDataService: new FoodCountDataService(
                config.GSPREAD_MARKET_ID
            ),
            foodCountInputService: new FoodCountInputService(orgDataService),
            personDataService,
            orgDataService,
            marketAdminService
        });
    }

    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId) as GuildServiceModel;
}

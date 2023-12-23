import { Config } from '../config';
import { type MarketConfigModel } from '../model';
import {
    type CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    MarketAdminService,
    PersonDataService,
    NightDataService,
    MarkdownService
} from '../service';

// technically we want to instantiate this once,
// and don't really want services in utilities, but since our
// per-market config data is stored in a gspread, we kinda have to
// break the rules

const servicesByGuildId = new Map<
    string,
    GuildServiceModel & {
        // also return the config so we can test it
        config: MarketConfigModel;
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
export async function GetGuildServices(
    guildId: string,
    coreDataService: CoreDataService
) {
    if (!servicesByGuildId.has(guildId)) {
        const config = await coreDataService.getMarketConfigByGuildId(guildId);

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

import { WaitingForConfig } from '../utility';
import {
    CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    NmAdminService,
    PersonSheetService,
    NightDataService,
    MarkdownService,
    PgService
} from '../service';
import { PersonService } from '../service/person.service';

// technically we want to instantiate this once,
// and don't really want services in utilities, but since our
// per-market config data is stored in a gspread, we kinda have to
// break the rules

const servicesByGuildId = new Map<string, GuildServiceModel>();

export interface GuildServiceModel {
    coreDataService: CoreDataService;
    foodCountDataService: FoodCountDataService;
    foodCountInputService: FoodCountInputService;
    orgDataService: OrgDataService;
    personDataService: PersonSheetService;
    personService: PersonService;
    nightDataService: NightDataService;
    markdownService: MarkdownService;
    marketAdminService: NmAdminService;
}

// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
export async function GetGuildServices(guildId: string) {
    const { pgConfig, nmConfig } = await WaitingForConfig;

    const coreDataService = new CoreDataService(nmConfig);

    if (!servicesByGuildId.has(guildId)) {
        const pgService = new PgService(pgConfig);
        const { GSPREAD_MARKET_ID } =
            await coreDataService.getMarketConfigByGuildId(guildId);

        const orgDataService = new OrgDataService(GSPREAD_MARKET_ID);

        const personDataService = new PersonSheetService(
            GSPREAD_MARKET_ID,
            pgService
        );

        const personService = new PersonService(personDataService);
        const nightDataService = new NightDataService(
            GSPREAD_MARKET_ID,
            personDataService
        );

        const markdownService = new MarkdownService(coreDataService);

        const marketAdminService = new NmAdminService(
            GSPREAD_MARKET_ID,
            personDataService
        );

        servicesByGuildId.set(guildId, {
            markdownService,
            coreDataService,
            nightDataService,
            foodCountDataService: new FoodCountDataService(GSPREAD_MARKET_ID),
            foodCountInputService: new FoodCountInputService(orgDataService),
            personDataService,
            orgDataService,
            marketAdminService
        });
    }

    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId) as GuildServiceModel;
}

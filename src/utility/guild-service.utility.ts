import { GetEnv, WaitingForConfig } from '../utility';
import {
    CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    NmAdminService,
    PersonSheetService,
    NightDataService,
    MarkdownService,
    OnboardingService,
    GoogleDriveService,
    EntityService,
    RdbService,
    PersonRdbService,
    AccessRdbService
} from '../service';

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
    personSheetService: PersonSheetService;
    personRdbService: PersonRdbService;
    nightDataService: NightDataService;
    markdownService: MarkdownService;
    marketAdminService: NmAdminService;
    onboardingService: OnboardingService;
    accessRdbService: AccessRdbService;
}

// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
export async function GetGuildServices(guildId: string) {
    const { nmConfig, rdbConfig } = await WaitingForConfig;

    const rdbService = new RdbService(`nm-${GetEnv()}`, rdbConfig);
    const coreDataService = new CoreDataService(nmConfig);

    if (!servicesByGuildId.has(guildId)) {
        // const pgService = new PgService(pgConfig);
        const { NM_INSTANCE_GSPREAD_ID } =
            await coreDataService.getMarketConfigByGuildId(guildId);

        const orgDataService = new OrgDataService(NM_INSTANCE_GSPREAD_ID);

        const personSheetService = new PersonSheetService(
            NM_INSTANCE_GSPREAD_ID
            // pgService
        );

        const personRdbService = new PersonRdbService(
            new EntityService(rdbService),
            rdbService
        );
        const nightDataService = new NightDataService(
            NM_INSTANCE_GSPREAD_ID,
            personSheetService
        );
        const googleDriveService = new GoogleDriveService(nmConfig);

        const markdownService = new MarkdownService(googleDriveService);

        const marketAdminService = new NmAdminService(
            NM_INSTANCE_GSPREAD_ID,
            personSheetService
        );
        const accessRdbService = new AccessRdbService(rdbService);

        servicesByGuildId.set(guildId, {
            markdownService,
            coreDataService,
            nightDataService,
            foodCountDataService: new FoodCountDataService(
                NM_INSTANCE_GSPREAD_ID
            ),
            foodCountInputService: new FoodCountInputService(orgDataService),
            personSheetService,
            personRdbService,
            orgDataService,
            marketAdminService,
            onboardingService: new OnboardingService(
                nmConfig,
                personRdbService,
                personSheetService,
                googleDriveService
            ),
            accessRdbService
        });
    }

    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId) as GuildServiceModel;
}

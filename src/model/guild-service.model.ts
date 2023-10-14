import type {
    CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    PersonDataService,
    NightDataService,
    MarkdownService,
    ProcessEventService,
    DiscordReplyService
} from '../service';

export interface GuildServiceModel {
    coreDataService: CoreDataService;
    foodCountDataService: FoodCountDataService;
    foodCountInputService: FoodCountInputService;
    orgDataService: OrgDataService;
    personDataService: PersonDataService;
    nightDataService: NightDataService;
    markdownService: MarkdownService;
    processEventService: ProcessEventService;
    discordReplyService: DiscordReplyService;
}

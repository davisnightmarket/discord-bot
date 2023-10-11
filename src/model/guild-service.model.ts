import type {
    CoreDataService,
    FoodCountDataService,
    FoodCountInputService,
    OrgDataService,
    PersonDataService,
    NightDataService,
    MessageService
} from '../service';

export interface GuildServiceModel {
    coreDataService: CoreDataService;
    foodCountDataService: FoodCountDataService;
    foodCountInputService: FoodCountInputService;
    orgDataService: OrgDataService;
    personDataService: PersonDataService;
    nightDataService: NightDataService;
    messageService: MessageService;
}

import type {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmNightDataService
} from '../service';

export interface GuildServiceModel {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonDataService;
    nightDataService: NmNightDataService;
}

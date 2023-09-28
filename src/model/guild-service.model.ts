import type {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmOpsDataService
} from '../service';

export interface GuildServiceModel {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonDataService;
    opsDataService: NmOpsDataService;
}

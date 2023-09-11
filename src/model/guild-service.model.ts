import type {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmPickupsDataService
} from '../nm-service';

export interface GuildServiceModel {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonDataService;
    pickupsDataService: NmPickupsDataService;
}

export type GuildServiceMapModel = Record<string, GuildServiceModel>;

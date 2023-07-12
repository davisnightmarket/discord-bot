import type {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmPickupsDataService
} from '../nm-service';

/* Models for services taht are guild specific */

export interface GuildServiceModel {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonDataService;
    pickupsDataService: NmPickupsDataService;
}

export type GuildServiceMapModel = {
    [k in string]: GuildServiceModel;
};

import type {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService
} from '../nm-service';

/* Models for services taht are guild specific */

export interface GuildServiceModel {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonDataService;
}
export type GuildServiceMapModel = {
    [k in string]: GuildServiceModel;
};

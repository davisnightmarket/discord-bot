import {
    type NmFoodCountDataService,
    type NmFoodCountInputService,
    type NmOrgService,
    type NmPersonService
} from '../nm-service';

/* Models for services taht are guild specific */

export interface GuildServiceModel {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonService;
}

export type GuildServiceMapModel = {
    [k in string]: GuildServiceModel;
};

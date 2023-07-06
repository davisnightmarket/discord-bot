import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonService
} from '../nm-service';

/* Models for services taht are guild specific */

export type GuildServiceModel = {
    foodCountDataInstanceService: NmFoodCountDataService;
    foodCountInputInstanceService: NmFoodCountInputService;
    orgCoreService: NmOrgService;
    personCoreService: NmPersonService;
};
export type GuildServiceMapModel = {
    [k in string]: GuildServiceModel;
};

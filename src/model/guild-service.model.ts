import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonService
} from '../nm-service';

export type GuildServiceModel = {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgService: NmOrgService;
    personService: NmPersonService;
};
export type GuildServiceMapModel = {
    [k in string]: GuildServiceModel;
};

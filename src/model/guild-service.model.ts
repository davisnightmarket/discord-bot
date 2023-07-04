import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonService
} from '../nm-service';

/* Models for services taht are guild specific */

export type GuildServiceModel = {
    foodCountDataService: NmFoodCountDataService;
    foodCountInputService: NmFoodCountInputService;
    orgService: NmOrgService;
    personService: NmPersonService;
};
export type GuildServiceMapModel = {
    [k in string]: GuildServiceModel;
};

https://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@github.com/davisnightmarket/discord-bot.git

import { ConfigSerive } from "../src/service"

export const config = new ConfigSerive();

export const services = config.getSericesFotTest();

export const foodCountDataService = services.foodCountDataService;
export const foodCountInputService = services.foodCountInputService;
export const personCoreService = services.personCoreService;
export const orgCoreService = services.orgCoreService;

import { GoogleSpreadsheetsService } from "../src/service";
import { ConfigInstanceByGuildIdGet, InitInstanceServices } from "../src/utility";

export const config = ConfigInstanceByGuildIdGet('##TEST##');

if (config === undefined) {
    throw new Error("Can't find test config!");
}

export const services = InitInstanceServices(config);

export const foodCountDataService = services.foodCountDataService;
export const foodCountInputService = services.foodCountInputService;
export const personCoreService = services.personCoreService;
export const orgCoreService = services.orgCoreService;

export const coreSheetService = new GoogleSpreadsheetsService(config.GSPREAD_CORE_PERSON_ID);
export const foodSheetService = new GoogleSpreadsheetsService(config.GSPREAD_FOODCOUNT_ID);


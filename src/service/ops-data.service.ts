import { NmRoleType, NmDayNameType } from '../model';
import { GetChannelDayToday } from '../utility';
import {
    GoogleSheetService,
    SpreadsheetDataModel,
    NmPersonDataService
} from './';
export interface PickUp extends SpreadsheetDataModel {}

export type OpsModel = {
    day: NmDayNameType;
    role: NmRoleType;
    time: string;
    org: string;
    volunteer1: string;
    volunteer2: string;
    volunteer3: string;
    comments: string;
    contact: string;
};

export class NmOpsDataService {
    private readonly opsSheetService: GoogleSheetService<OpsModel>;
    personCoreDataService: NmPersonDataService;
    constructor(
        spreadsheetId: string,
        personCoreDataService: NmPersonDataService
    ) {
        this.opsSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'ops'
        });
        this.personCoreDataService = personCoreDataService;
    }

    async getOpsByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<OpsModel[]> {
        const p = await this.opsSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }
}

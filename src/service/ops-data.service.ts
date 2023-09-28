import { NmRoleType, NmDayNameType } from '../model';
import { GoogleSheetService, SpreadsheetDataModel } from './';
export interface PickUp extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmRoleType;
    time: string;
    org: string;
    volunteer1: string;
    volunteer2: string;
    volunteer3: string;
    comments: string;
    contact: string;
}

export class NmOpsDataService {
    private readonly opsSheetService: GoogleSheetService<PickUp>;

    constructor(spreadsheetId: string) {
        this.opsSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'ops'
        });
    }

    async getOpsByDay(day: NmDayNameType): Promise<PickUp[]> {
        const p = await this.opsSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }
}

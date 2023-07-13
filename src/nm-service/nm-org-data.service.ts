import { Sheet } from '../service';

interface OrgModel {
    name: string;
    nameAlt: string;
}

export class NmOrgService {
    private readonly orgSheetService: Sheet<OrgModel>;

    constructor(orgSpreadsheetId: string) {
        this.orgSheetService = new Sheet({
            sheetId: orgSpreadsheetId,
            range: 'org!A2:C',
        });
    }

    async getOrgList(): Promise<OrgModel[]> {
        return await this.orgSheetService.get()
    }
}

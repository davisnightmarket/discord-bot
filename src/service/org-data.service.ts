import FuzzySearch from 'fuzzy-search';
import { GoogleSheetService, SpreadsheetDataModel } from '../service';

interface OrgModel extends SpreadsheetDataModel {
    name: string;
    nameAlt: string;
}

export class NmOrgService {
    private readonly orgSheetService: GoogleSheetService<OrgModel>;

    constructor(spreadsheetId: string) {
        this.orgSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: 'org'
        });
    }

    async getOrgList(): Promise<OrgModel[]> {
        return await this.orgSheetService.getAllRowsAsMaps();
    }

    async getOrgFromFuzzyString(orgFuzzy: string): Promise<string | undefined> {
        const orgList = (await this.getOrgList()).map((a) => ({
            ...a,
            nameSearchable: `${a?.nameAlt?.split(',')?.join(' ') ?? ''} ${
                a.name
            }`
        }));

        const searcher = new FuzzySearch(orgList, ['nameSearchable'], {
            caseSensitive: false,
            sort: true
        });

        return searcher.search(orgFuzzy).map((a) => a.name)[0];
    }
}

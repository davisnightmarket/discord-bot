import FuzzySearch from 'fuzzy-search';
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

    async getOrgFromFuzzyString(orgFuzzy: string): Promise<string | undefined> {
        const orgList = (await this.getOrgList()).map((a) => {
            const bla = a?.nameAlt.split(",").join(" ") ?? '';

            return ({
                ...a,
                nameSearchable: `${bla} ${a.name}`
            })
        });
    
        const searcher = new FuzzySearch(orgList, ['nameSearchable'], {
            caseSensitive: false,
            sort: true
        });

        return searcher.search(orgFuzzy).map((a) => a.name)[0];
    }
}

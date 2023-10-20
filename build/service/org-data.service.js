"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgDataService = void 0;
const fuzzy_search_1 = __importDefault(require("fuzzy-search"));
const service_1 = require("../service");
class OrgDataService {
    constructor(spreadsheetId) {
        this.orgSheetService = new service_1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'org'
        });
    }
    async getOrgList() {
        return await this.orgSheetService.getAllRowsAsMaps();
    }
    async getOrgFromFuzzyString(orgFuzzy) {
        const orgList = (await this.getOrgList()).map((a) => ({
            ...a,
            nameSearchable: `${a?.nameAlt?.split(',')?.join(' ') ?? ''} ${a.name}`
        }));
        const searcher = new fuzzy_search_1.default(orgList, ['nameSearchable'], {
            caseSensitive: false,
            sort: true
        });
        return searcher.search(orgFuzzy).map((a) => a.name)[0];
    }
}
exports.OrgDataService = OrgDataService;

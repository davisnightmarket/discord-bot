"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmOrgService = void 0;
const fuzzy_search_1 = __importDefault(require("fuzzy-search"));
const service_1 = require("../service");
class NmOrgService {
    constructor(orgSpreadsheetId) {
        this.orgSheetService = new service_1.Sheet({
            sheetId: orgSpreadsheetId,
            range: 'org!A2:C',
        });
    }
    getOrgList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orgSheetService.get();
        });
    }
    getOrgFromFuzzyString(orgFuzzy) {
        return __awaiter(this, void 0, void 0, function* () {
            const orgList = (yield this.getOrgList()).map((a) => (Object.assign(Object.assign({}, a), { nameSearchable: `${a.nameAlt} ${a.name}` })));
            const searcher = new fuzzy_search_1.default(orgList, ['nameSearchable'], {
                caseSensitive: false,
                sort: true
            });
            return searcher.search(orgFuzzy).map((a) => a.name)[0];
        });
    }
}
exports.NmOrgService = NmOrgService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmFoodCountDataService = exports.FOODCOUNT_HEADERS = void 0;
const _1 = require(".");
// collumns for a food count sheet in case we need to create a new one
exports.FOODCOUNT_HEADERS = ['date', 'org', 'lbs', 'reporter', 'note'];
class NmFoodCountDataService {
    constructor(spreadsheetId) {
        this.foodCountSheetMap = new Map();
        this.spreadsheetId = spreadsheetId;
    }
    createSheet(year) {
        // create the new sheet wraper
        const sheet = new _1.GoogleSheetService({
            spreadsheetId: this.spreadsheetId,
            sheetName: `food-count-${year}`,
            headersList: exports.FOODCOUNT_HEADERS
        });
        // add it to the map
        this.foodCountSheetMap.set(year, sheet);
        // return
        return sheet;
    }
    getSheetByCurrentYear(year = new Date().getFullYear()) {
        return this.foodCountSheetMap.get(year) ?? this.createSheet(year);
    }
    async appendFoodCount(foodCount, year) {
        await this.getSheetByCurrentYear(year).appendOneMap(foodCount);
    }
}
exports.NmFoodCountDataService = NmFoodCountDataService;

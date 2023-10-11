"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountDataService = exports.FOODCOUNT_HEADERS = void 0;
const _1 = require(".");
// collumns for a food count sheet in case we need to create a new one
exports.FOODCOUNT_HEADERS = ['date', 'org', 'lbs', 'reporter', 'note'];
class FoodCountDataService {
    constructor(spreadsheetId) {
        this.foodCountSheetMap = new Map();
        this.spreadsheetId = spreadsheetId;
    }
    async getFoodCountByDate(date) {
        // todo: this will fail on January first
        const rows = await (await this.getSheetByCurrentYear()).getAllRowsAsMaps({ limitRows: 500 });
        return rows.filter((a) => new Date(a.date) === date);
    }
    async createSheet(year) {
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
    async getSheetByCurrentYear(year = new Date().getFullYear()) {
        return (this.foodCountSheetMap.get(year) ?? (await this.createSheet(year)));
    }
    async appendFoodCount(foodCount, year) {
        await (await this.getSheetByCurrentYear(year)).appendOneMap(foodCount);
    }
}
exports.FoodCountDataService = FoodCountDataService;

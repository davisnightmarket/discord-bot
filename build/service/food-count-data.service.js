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
        // todo: this will fail on January first but why?
        const year = date.getFullYear();
        const rows = await (await this.getSheetByYear(year)).getAllRowsAsMaps({ limitRows: 500 });
        return rows.filter((a) => {
            const d = new Date(a.date);
            return (d.getDate() + d.getMonth() + d.getFullYear() ===
                date.getDate() + date.getMonth() + date.getFullYear());
        });
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
    async getSheetByYear(year = new Date().getFullYear()) {
        return (this.foodCountSheetMap.get(year) ?? (await this.createSheet(year)));
    }
    async getSheetByCurrentYear() {
        const year = new Date().getFullYear();
        return (this.foodCountSheetMap.get(year) ?? (await this.createSheet(year)));
    }
    async appendFoodCount(foodCount, year) {
        await (await this.getSheetByYear(year)).appendOneMap(foodCount);
    }
}
exports.FoodCountDataService = FoodCountDataService;

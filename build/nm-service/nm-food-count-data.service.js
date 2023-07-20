"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmFoodCountDataService = exports.FOODCOUNT_HEADERS = void 0;
const service_1 = require("../service");
// collumns for a food count sheet in case we need to create a new one
exports.FOODCOUNT_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];
class NmFoodCountDataService {
    constructor(foodCountSheetId) {
        this.foodCountSheetMap = new Map();
        this.foodCountSheetId = foodCountSheetId;
    }
    createSheet(year) {
        // create the new sheet wraper
        const sheet = new service_1.Sheet({
            sheetId: this.foodCountSheetId,
            range: `'food-count ${year}'!A1:E`,
            defaultHeaders: exports.FOODCOUNT_HEADERS
        });
        // add it to the map
        this.foodCountSheetMap.set(year, sheet);
        // return
        return sheet;
    }
    for(year = new Date().getFullYear()) {
        return this.foodCountSheetMap.get(year) ?? this.createSheet(year);
    }
    async getFoodCount(year) {
        return await this.for(year).get();
    }
    async appendFoodCount(foodCount, year) {
        await this.for(year).append(foodCount);
    }
}
exports.NmFoodCountDataService = NmFoodCountDataService;

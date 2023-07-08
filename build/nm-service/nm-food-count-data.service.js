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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmFoodCountDataService = exports.GSPREAD_SHEET_FOODCOUNT_HEADERS = exports.GSPREAD_FOODCOUNT_SHEET_PREFIX = void 0;
const service_1 = require("../service");
/**
 *  FOODCOUNT
 */
// the prefix for food-count sheets within spreadsheet - we make a new one every year
// sheet name will look like: "food-count 2023"
exports.GSPREAD_FOODCOUNT_SHEET_PREFIX = 'food-count';
// corresond to collumns in food count sheet
exports.GSPREAD_SHEET_FOODCOUNT_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];
class NmFoodCountDataService {
    getFoodCountSheetName(
    // defaults to current year
    year = new Date().getFullYear()) {
        return `${exports.GSPREAD_FOODCOUNT_SHEET_PREFIX} ${year}`;
    }
    fromFoodCountMapToList({ date, org, lbs, reporter, note }) {
        return [date, org, lbs, reporter, note];
    }
    getFoodCount(sheetName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.foodCountSheetService.rangeGet(`'${sheetName}'!A2:E`))) !== null && _a !== void 0 ? _a : []);
        });
    }
    appendFoodCount(foodCount, 
    // the current year's sheet name by default
    sheet = this.getFoodCountSheetName()) {
        return __awaiter(this, void 0, void 0, function* () {
            // we create a new sheet every year, so we test if the sheet exists, and create it if not
            if (yield this.foodCountSheetService.sheetCreateIfNone(sheet)) {
                yield this.foodCountSheetService.rowsAppend([exports.GSPREAD_SHEET_FOODCOUNT_HEADERS], sheet);
            }
            // rowsAppend returns an array tuple of range string, and index inserted
            return [
                yield this.foodCountSheetService.rowsAppend([this.fromFoodCountMapToList(foodCount)], sheet),
                // the length minus 1 is this the zero index of the inserted count
                (yield this.foodCountSheetService.rangeGet(`'${sheet}'!A1:A`))
                    .length - 1
            ];
        });
    }
    deleteFoodCountByIndex(startIndex, 
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName = this.getFoodCountSheetName()) {
        return __awaiter(this, void 0, void 0, function* () {
            const sheetId = yield this.foodCountSheetService.getSheetIdByName(sheetName);
            yield this.foodCountSheetService.rowsDelete(startIndex, startIndex + 1, sheetId);
        });
    }
    deleteLastFoodCount(
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName = this.getFoodCountSheetName()) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const range = (_a = (yield this.foodCountSheetService.rangeGet(`'${sheetName}'!A:E`))) !== null && _a !== void 0 ? _a : [];
            const lastRowIndex = range.length;
            if (lastRowIndex < 2) {
                console.error('We cannot delete the header');
                return;
            }
            yield this.foodCountSheetService.rowsWrite([['', '', '', '', '']], `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`);
        });
    }
    constructor(foodCountSheetId) {
        this.foodCountSheetService = new service_1.GoogleSpreadsheetsService(foodCountSheetId);
    }
}
exports.NmFoodCountDataService = NmFoodCountDataService;

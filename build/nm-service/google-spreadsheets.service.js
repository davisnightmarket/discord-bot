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
exports.GoogleSpreadsheetsService = exports.Alphabet = exports.AlphaIndex = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const utility_1 = require("../utility");
const nm_secrets_utility_1 = require("../utility/nm-secrets.utility");
const dbg = (0, utility_1.Dbg)('GoogleSpreadsheetsService');
// the alphabet indexed in array
exports.AlphaIndex = Array.from(Array(26)).map((e, i) => i + 65);
// the alphabet in an array
exports.Alphabet = exports.AlphaIndex.map((x) => String.fromCharCode(x).toUpperCase());
const Gspread = (0, nm_secrets_utility_1.GetNmSecrets)().then((keys) => {
    const credentials = keys.googleSpreadsheetsKeys;
    const auth = new google_auth_library_1.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    return [googleapis_1.google.sheets({ version: 'v4', auth }), auth];
});
class GoogleSpreadsheetsService {
    columnIndexFromLetter(a) {
        const n = exports.Alphabet.indexOf(a.toUpperCase());
        if (n < 0) {
            throw new Error('that letter does not exists');
        }
        return n;
    }
    rangeGet(range) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            validate(range);
            const spreadsheetId = this.spreadsheetId;
            const [gspread] = yield Gspread;
            const result = yield gspread.spreadsheets.values.get({
                spreadsheetId,
                range
            });
            return ((_a = result.data.values) !== null && _a !== void 0 ? _a : []);
        });
    }
    rowsDelete(startIndex, endIndex, sheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const spreadsheetId = this.spreadsheetId;
            const requestBody = {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: 'ROWS',
                                startIndex,
                                endIndex
                            }
                        }
                    }
                ]
            };
            const [gspread] = yield Gspread;
            try {
                yield gspread.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody
                });
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
    rowsWrite(values, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values || !(values instanceof Array) || values.length === 0) {
                throw new Error('Must pass a valid values');
            }
            const spreadsheetId = this.spreadsheetId;
            validate(range);
            const [gspread] = yield Gspread;
            try {
                const result = yield gspread.spreadsheets.values.update({
                    spreadsheetId,
                    valueInputOption: 'RAW',
                    range,
                    requestBody: { values }
                });
                dbg('%d cells updated.', result.data.updatedCells);
                return result.data.updatedRange;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
    /**
     *
     * @param values string values to insert in sheet
     * @param range where in the sheet to insert
     * @param spreadsheetId which spreadsheet to insert
     * @returns range that was affected
     */
    rowsAppend(values, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values || !(values instanceof Array) || values.length === 0) {
                throw new Error('Must pass a valid values');
            }
            const spreadsheetId = this.spreadsheetId;
            validate(range);
            const [gspread] = yield Gspread;
            return yield new Promise((resolve, reject) => {
                gspread.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values }
                }, function (err, response) {
                    if (err != null) {
                        reject(err);
                    }
                    resolve(response.data.updates.updatedRange);
                });
            });
        });
    }
    sheetExists(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const spreadsheetId = this.spreadsheetId;
            try {
                const id = yield this.getSheetIdByName(title);
                const request = {
                    spreadsheetId,
                    ranges: [title],
                    includeGridData: false
                };
                // if we get a positive number the sheet exists
                return id >= 0;
            }
            catch (e) {
                // if we get an error the sheet does not exist
                return false;
            }
        });
    }
    getSheetIdByName(title) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        return __awaiter(this, void 0, void 0, function* () {
            const spreadsheetId = this.spreadsheetId;
            try {
                const request = {
                    spreadsheetId,
                    ranges: [title],
                    includeGridData: false
                };
                const [gspread] = yield Gspread;
                const res = yield gspread.spreadsheets.get(request);
                if (!((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.sheets) === null || _b === void 0 ? void 0 : _b.length) ||
                    (!((_e = (_d = (_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.sheets[0]) === null || _d === void 0 ? void 0 : _d.properties) === null || _e === void 0 ? void 0 : _e.sheetId) &&
                        !(((_j = (_h = (_g = (_f = res === null || res === void 0 ? void 0 : res.data) === null || _f === void 0 ? void 0 : _f.sheets[0]) === null || _g === void 0 ? void 0 : _g.properties) === null || _h === void 0 ? void 0 : _h.sheetId) !== null && _j !== void 0 ? _j : 0) >= 0))) {
                    throw new Error(`Sheet ${title} does not exist in spreadsheet ${spreadsheetId}`);
                }
                return (_o = (_m = (_l = (_k = res === null || res === void 0 ? void 0 : res.data) === null || _k === void 0 ? void 0 : _k.sheets[0]) === null || _l === void 0 ? void 0 : _l.properties) === null || _m === void 0 ? void 0 : _m.sheetId) !== null && _o !== void 0 ? _o : 0;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
    sheetCreateIfNone(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const spreadsheetId = this.spreadsheetId;
            // we create a new sheet every year, so we test if the sheet exists, and create it if not
            if (!(yield this.sheetExists(title))) {
                yield this.sheetCreate(title);
                return true;
            }
            return false;
        });
    }
    sheetCreate(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const spreadsheetId = this.spreadsheetId;
            validate(title);
            const [gspread, auth] = yield Gspread;
            try {
                const request = {
                    spreadsheetId,
                    resource: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title
                                    }
                                }
                            }
                        ]
                    },
                    auth
                };
                yield gspread.spreadsheets.batchUpdate(request);
                return true;
            }
            catch (error) {
                console.error(error);
            }
            return false;
        });
    }
    sheetDestroy(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const spreadsheetId = this.spreadsheetId;
            validate(title);
            const [gspread, auth] = yield Gspread;
            try {
                const sheetId = yield this.getSheetIdByName(title);
                const request = {
                    spreadsheetId,
                    resource: {
                        requests: [
                            {
                                deleteSheet: {
                                    sheetId
                                }
                            }
                        ]
                    },
                    auth
                };
                yield gspread.spreadsheets.batchUpdate(request);
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    static create(spreadsheetId) {
        return new GoogleSpreadsheetsService(spreadsheetId);
    }
    constructor(spreadsheetId) {
        this.spreadsheetId = spreadsheetId;
    }
}
exports.GoogleSpreadsheetsService = GoogleSpreadsheetsService;
// abstract out test for range and spreadsheetId
function validate(range) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }
}

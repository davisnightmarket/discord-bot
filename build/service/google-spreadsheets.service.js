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
exports.Sheet = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const nm_secrets_utility_1 = require("../utility/nm-secrets.utility");
const DEAFULT_CACHE_TIME = 1000 * 60 * 60; // default to one hour
const Gspread = (0, nm_secrets_utility_1.GetNmSecrets)().then((keys) => {
    const credentials = keys.googleSpreadsheetsKeys;
    const auth = new google_auth_library_1.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    return [googleapis_1.google.sheets({ version: 'v4', auth }), auth];
});
class Sheet {
    constructor(config) {
        var _a;
        this.cache = [];
        this.cacheLastUpdated = 0;
        this.header = [];
        this.spreadsheetId = config.sheetId;
        this.range = config.range;
        this.cacheTime = (_a = config.cacheTime) !== null && _a !== void 0 ? _a : DEAFULT_CACHE_TIME;
        this.updateCache();
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cacheLastUpdated + this.cacheTime < Date.now()) {
                yield this.updateCache();
            }
            return this.cache;
        });
    }
    append(values) {
        return __awaiter(this, void 0, void 0, function* () {
            // if no header, the we need to update the cache
            if (this.header.length === 0)
                yield this.updateCache();
            // turn the models into rows
            const rows = values.map((value) => this.header.map((name) => { var _a; return (_a = value[name]) !== null && _a !== void 0 ? _a : ''; }));
            // append the rows to the sheet
            const [gspread] = yield Gspread;
            const req = gspread.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: this.range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: rows }
            });
            // append the rows to the cache if the call succeeds
            return yield req.then((res) => {
                var _a, _b, _c;
                this.cache.push(...values);
                return (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.updates) === null || _b === void 0 ? void 0 : _b.updatedRange) !== null && _c !== void 0 ? _c : [];
            });
        });
    }
    updateCache() {
        return __awaiter(this, void 0, void 0, function* () {
            // get the data from the spreed sheet
            const [gspread] = yield Gspread;
            const result = yield gspread.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.range,
            });
            if (!result.data.values)
                throw new Error("!!!");
            // update the cache using the headers in the range to map to build the model
            const [header, ...rows] = result.data.values;
            this.header = header.map(rowNameToModelKey);
            this.cache = rows
                .filter((row) => row.length !== 0) // exclude empty rows
                .map((row) => {
                var _a;
                const a = {};
                for (let i = 0; i < this.header.length; i++) {
                    a[this.header[i]] = (_a = row[i]) !== null && _a !== void 0 ? _a : '';
                }
                return a;
            });
            // the last time is was updated was right now!
            this.cacheLastUpdated = Date.now();
        });
    }
}
exports.Sheet = Sheet;
function rowNameToModelKey(rowName) {
    const [first, ...rest] = rowName.split(/[_-\s]/g);
    return first + rest.map(capitlize).join("");
}
function capitlize(word) {
    return word.charAt(0) + word.substring(1);
}

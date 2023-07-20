"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheetCreate = exports.Sheet = void 0;
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
        this.cache = [];
        this.cacheLastUpdated = 0;
        this.header = [];
        // store params
        this.spreadsheetId = config.sheetId;
        this.range = config.range;
        this.cacheTime = config.cacheTime ?? DEAFULT_CACHE_TIME;
        // if request, make sure the sheet exists
        // using the default headers to create a new sheet if needed
        if (config.defaultHeaders) {
            this.createIfNone(config.defaultHeaders);
        }
        // update the cache and get headers
        this.updateCache();
    }
    async createIfNone(header) {
        // get the name of the sheet
        const name = a1RangeToGridRange(this.range).sheet;
        // create it if it dosent exist
        if (await sheetExists(this.spreadsheetId, name)) {
            await sheetCreate(this.spreadsheetId, name);
            // add in the headers
            const [gspread] = await Gspread;
            await gspread.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: this.range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [header] }
            });
        }
    }
    async get() {
        if (this.cacheLastUpdated + this.cacheTime < Date.now()) {
            await this.updateCache();
        }
        return this.cache.filter(empty);
    }
    async search(partial) {
        const values = await this.get();
        return values.find(matchs(partial));
    }
    async searchIndex(partial) {
        const values = await this.get();
        return values.findIndex(matchs(partial));
    }
    async update(source, update) {
        // get complete item and update it
        const full = await this.search(source);
        if (!full)
            throw new Error("Can not find item to update");
        const row = this.valueToRow({ ...full, ...update });
        // get the range so that we can update it
        const range = await this.getRangeForItem(source);
        // update the spread sheet
        const [gspread] = await Gspread;
        await gspread.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            valueInputOption: 'USER_ENTERED',
            range,
            requestBody: { values: [row] }
        });
        // update the cache
        await this.updateCache();
    }
    async getRangeForItem(value) {
        // parse the range so the we can figure out the row for the element
        const range = a1RangeToGridRange(this.range);
        // if no start row is provided, then that means its 1
        range.a.row = range.a.row ?? 1;
        // move down to the row of the value
        const index = await this.searchIndex(value);
        range.a.row += index + 1; // move past header
        // and make it the end row as well
        range.b.row = range.a.row;
        // convert back to a1 range and return
        return gridRangeToA1Range(range);
    }
    valueToRow(value) {
        return this.header.map((name) => value[name] ?? '');
    }
    async append(values) {
        // turn the models into rows
        const rows = values.map((value) => this.valueToRow(value));
        // append the rows to the sheet
        const [gspread] = await Gspread;
        await gspread.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: this.range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: rows }
        });
        // update the cache
        await this.updateCache();
    }
    async updateCache() {
        // get the data from the spreed sheet
        const [gspread] = await Gspread;
        const result = await gspread.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: this.range,
        });
        if (!result.data.values)
            throw new Error("!!!");
        // update the cache using the headers in the range to map to build the model
        const [header, ...rows] = result.data.values;
        this.header = header.map(rowNameToModelKey);
        this.cache = rows
            .map((row) => {
            const a = {};
            for (let i = 0; i < this.header.length; i++) {
                a[this.header[i]] = row[i] ?? '';
            }
            return a;
        });
        // the last time is was updated was right now!
        this.cacheLastUpdated = Date.now();
    }
}
exports.Sheet = Sheet;
function matchs(a) {
    return (b) => Object.keys(a).some((key) => a[key] === b[key]);
}
function rowNameToModelKey(rowName) {
    const [first, ...rest] = rowName.split(/[_-\s]/g);
    return first + rest.map(capitlize).join("");
}
function capitlize(word) {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}
function empty(item) {
    return Object.values(item).some((value) => !!value);
}
function gridRangeToA1Range(r) {
    return `${r.sheet}!${r.a.col}${r.a.row ?? ''}:${r.b.col}${r.b.row ?? ''}`;
}
function a1RangeToGridRange(range) {
    const [area, sheet] = range.split("!").reverse();
    const [a, b] = area.split(":");
    function parseCell(cell) {
        if (!cell)
            throw new Error(`Invalid a1range ${range}!`);
        const matchs = cell.match(/([A-Z]+)(\d*)/);
        const col = matchs?.at(1);
        if (!col)
            throw new Error(`Invalid a1range ${range}!`);
        const row = matchs?.at(2);
        return {
            col,
            row: row ? parseInt(row) : undefined
        };
    }
    return {
        sheet,
        a: parseCell(a),
        b: parseCell(b),
    };
}
async function sheetCreate(spreadsheetId, title) {
    const [gspread, auth] = await Gspread;
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
        await gspread.spreadsheets.batchUpdate(request);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
exports.sheetCreate = sheetCreate;
async function getSheetIdByName(spreadsheetId, title) {
    try {
        const request = {
            spreadsheetId,
            ranges: [title],
            includeGridData: false
        };
        const [gspread] = await Gspread;
        const res = await gspread.spreadsheets.get(request);
        if (!res?.data?.sheets?.length ||
            (!res?.data?.sheets[0]?.properties?.sheetId &&
                !((res?.data?.sheets[0]?.properties?.sheetId ?? 0) >= 0))) {
            throw new Error(`Sheet ${title} does not exist in spreadsheet ${spreadsheetId}`);
        }
        return res?.data?.sheets[0]?.properties?.sheetId ?? 0;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
async function sheetExists(spreadsheetId, title) {
    try {
        const id = await getSheetIdByName(spreadsheetId, title);
        return id >= 0;
    }
    catch (e) {
        return false;
    }
}

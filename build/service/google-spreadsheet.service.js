"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSpreadsheetsService = exports.Alphabet = exports.AlphaIndex = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const utility_1 = require("../utility");
const secrets_utility_1 = require("../utility/secrets.utility");
const dbg = (0, utility_1.Dbg)('GoogleSpreadsheetsService');
// the alphabet indexed in array
exports.AlphaIndex = Array.from(Array(26)).map((e, i) => i + 65);
// the alphabet in an array
exports.Alphabet = exports.AlphaIndex.map((x) => String.fromCharCode(x).toUpperCase());
const Gspread = secrets_utility_1.NmSecrets.then((keys) => {
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
    async rangeGet(range) {
        validate(range);
        const spreadsheetId = this.spreadsheetId;
        const [gspread] = await Gspread;
        const result = await gspread.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        return (result.data.values ?? []);
    }
    async sheetClear(sheetName) {
        const spreadsheetId = this.spreadsheetId;
        const [gspread] = await Gspread;
        try {
            await gspread.spreadsheets.values.batchClear({
                spreadsheetId,
                requestBody: {
                    ranges: [sheetName]
                }
            });
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async rowsDelete(startIndex, endIndex, sheetId) {
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
        const [gspread] = await Gspread;
        try {
            await gspread.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody
            });
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async rowsWrite(values, range) {
        if (!values || !(values instanceof Array) || values.length === 0) {
            throw new Error('Must pass a valid values');
        }
        const spreadsheetId = this.spreadsheetId;
        validate(range);
        const [gspread] = await Gspread;
        try {
            const result = await gspread.spreadsheets.values.update({
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
    }
    /**
     *
     * @param values string values to insert in sheet
     * @param range where in the sheet to insert
     * @returns range that was affected
     */
    async rowsAppend(values, range) {
        if (!values || !(values instanceof Array) || values.length === 0) {
            throw new Error('Must pass a valid values');
        }
        const spreadsheetId = this.spreadsheetId;
        validate(range);
        const [gspread] = await Gspread;
        return await new Promise((resolve, reject) => {
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
    }
    async sheetExists(title) {
        const spreadsheetId = this.spreadsheetId;
        try {
            const id = await this.getSheetIdByTitle(title);
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
    }
    async getSheetIdByTitle(title) {
        const spreadsheetId = this.spreadsheetId;
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
    async sheetCreateIfNone(title) {
        const spreadsheetId = this.spreadsheetId;
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (!(await this.sheetExists(title))) {
            await this.sheetCreate(title);
            return true;
        }
        return false;
    }
    async sheetCreate(title) {
        const spreadsheetId = this.spreadsheetId;
        validate(title);
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
        }
        return false;
    }
    async sheetDestroy(title) {
        const spreadsheetId = this.spreadsheetId;
        validate(title);
        const [gspread, auth] = await Gspread;
        try {
            const sheetId = await this.getSheetIdByTitle(title);
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
            await gspread.spreadsheets.batchUpdate(request);
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
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

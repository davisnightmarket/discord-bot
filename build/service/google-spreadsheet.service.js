"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSpreadsheetsService = exports.Alphabet = exports.AlphaIndex = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const utility_1 = require("../utility");
const dbg = (0, utility_1.GetDebug)('GoogleSpreadsheetsService');
// the alphabet indexed in array
exports.AlphaIndex = Array.from(Array(26)).map((e, i) => i + 65);
// the alphabet in an array
exports.Alphabet = exports.AlphaIndex.map((x) => String.fromCharCode(x).toUpperCase());
const Gspread = utility_1.WaitingForConfig.then((keys) => {
    const credentials = keys.googleApiConfig;
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
    letterFromColumnIndex(a) {
        return exports.Alphabet[a];
    }
    async rangeGet(range) {
        await this.activeOp;
        this.validateRange(range);
        const spreadsheetId = this.spreadsheetId;
        const [gspread] = await Gspread;
        this.activeOp = gspread.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        const result = await this.activeOp;
        return (result.data.values ?? []);
    }
    // opsQueue: GaxiosPromise[] = [];
    async sheetClear(sheetName) {
        await this.activeOp;
        // await Promise.all(this.opsQueue);
        const spreadsheetId = this.spreadsheetId;
        const [gspread] = await Gspread;
        try {
            this.activeOp = gspread.spreadsheets.values.batchClear({
                spreadsheetId,
                requestBody: {
                    ranges: [sheetName]
                }
            });
            await this.activeOp;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async rowsDelete(sheetTitle, startIndex, endIndex) {
        await this.activeOp;
        // await Promise.all(this.opsQueue);
        const spreadsheetId = this.spreadsheetId;
        const sheetId = await this.getSheetIdByTitle(sheetTitle);
        if (!sheetId) {
            throw new Error('No sheet with name ' + sheetTitle);
        }
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
            this.activeOp = gspread.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody
            });
            await this.activeOp;
        }
        catch (err) {
            console.error(err);
        }
    }
    async rowsWrite(values, range) {
        await this.activeOp;
        // await Promise.all(this.opsQueue);
        if (!values || !(values instanceof Array) || values.length === 0) {
            throw new Error('Must pass a valid values');
        }
        const spreadsheetId = this.spreadsheetId;
        this.validateRange(range);
        const [gspread, auth] = await Gspread;
        try {
            this.activeOp = gspread.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    range,
                    majorDimension: 'ROWS',
                    values
                }
            });
            const result = await this.activeOp;
            // this.opsQueue.push(
            //     op.then((a) => {
            //         this.opsQueue.slice(
            //             this.opsQueue.findIndex((a) => a === op),
            //             1
            //         );
            //         return a as GaxiosResponse;
            //     })
            // );
            // const result = await op;
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
        await this.activeOp;
        const spreadsheetId = this.spreadsheetId;
        this.validateRange(range);
        const [gspread] = await Gspread;
        this.activeOp = gspread.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });
        await this.activeOp;
    }
    async rowsPrepend(values, title, startColumn, startIndex) {
        await this.activeOp;
        const spreadsheetId = this.spreadsheetId;
        this.validateRange(title);
        const [gspread, auth] = await Gspread;
        const endIndex = startIndex + values.length;
        const request = {
            spreadsheetId,
            resource: {
                requests: [
                    {
                        insertDimension: {
                            range: {
                                sheetId: await this.getSheetIdByTitle(title),
                                dimension: 'ROWS',
                                startIndex,
                                endIndex
                            },
                            inheritFromBefore: false
                        }
                    }
                ]
            },
            auth
        };
        try {
            this.activeOp = gspread.spreadsheets.batchUpdate(request);
            await this.activeOp;
        }
        catch (e) {
            console.error(e);
            return;
        }
        try {
            const range = `${title}!${startColumn}${startIndex + 1}`;
            this.activeOp = gspread.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    range,
                    majorDimension: 'ROWS',
                    values
                }
            });
            await this.activeOp;
        }
        catch (e) {
            console.error(e);
        }
    }
    async sheetExists(title) {
        return !!(await this.getSheetTitleList()).find((t) => t === title);
    }
    async getSheetIdList() {
        const spreadsheetId = this.spreadsheetId;
        try {
            const request = {
                spreadsheetId
            };
            const [gspread] = await Gspread;
            const res = await gspread.spreadsheets.get(request);
            return (res?.data?.sheets
                ?.map((a) => a.properties?.sheetId)
                .filter((a) => !!a) ?? []);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async getSheetTitleList() {
        const spreadsheetId = this.spreadsheetId;
        try {
            const request = {
                spreadsheetId
            };
            const [gspread] = await Gspread;
            const res = await gspread.spreadsheets.get(request);
            return (res?.data?.sheets
                ?.map((a) => a.properties?.title)
                .filter((a) => !!a) ?? []);
        }
        catch (err) {
            console.error(err);
            throw err;
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
    async getOrCreateSheet(title, { headersList, range } = {}) {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (!(await this.sheetExists(title))) {
            if (!(await this.createSheet(title, {
                headersList,
                range
            }))) {
                throw new Error('getOrCreateSheet: Could not create sheet!');
            }
        }
        return await this.getSheetIdByTitle(title);
    }
    async createSheet(title, { headersList, range } = {}) {
        const spreadsheetId = this.spreadsheetId;
        this.validateRange(title);
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
            try {
                await gspread.spreadsheets.batchUpdate(request);
                if (headersList && range) {
                    await this.rowsAppend([headersList], range);
                }
            }
            catch (e) {
                console.error(e);
            }
            return true;
        }
        catch (error) {
            console.error(error);
        }
        return false;
    }
    async sheetDestroy(title) {
        const spreadsheetId = this.spreadsheetId;
        this.validateRange(title);
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
    validateRange(range) {
        if (!range) {
            throw new Error('Must pass a valid sheet "range"');
        }
    }
    constructor(spreadsheetId) {
        this.activeOp = Promise.resolve();
        this.spreadsheetId = spreadsheetId;
    }
}
exports.GoogleSpreadsheetsService = GoogleSpreadsheetsService;

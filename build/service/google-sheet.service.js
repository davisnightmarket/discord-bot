"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetService = void 0;
const google_spreadsheet_service_1 = require("./google-spreadsheet.service");
class GoogleSheetService {
    constructor({ spreadsheetId, sheetName, headersList }) {
        // store params
        this.spreadsheetService = new google_spreadsheet_service_1.GoogleSpreadsheetsService(spreadsheetId);
        this.sheetName = sheetName;
        this.spreadsheetService.sheetCreateIfNone(this.sheetName);
        this.waitingForSheetId = this.spreadsheetService.getSheetIdByTitle(this.sheetName);
        this.waitingForHeaderList = this.getOrCreateHeaders(headersList);
    }
    // TODO: test this
    async updateRowByIndex(index, value) {
        return await this.spreadsheetService.rowsWrite([[value]], this.getSheetRangeString(`A${index}`));
    }
    // TODO: test this
    async appendOneRow(row) {
        await this.spreadsheetService.rowsAppend([row], this.getSheetRangeString());
    }
    // TODO: test this
    async appendOneMap(map) {
        const headerList = await this.waitingForHeaderList;
        const row = headerList.map((a) => map[a]);
        await this.spreadsheetService.rowsAppend([row], this.getSheetRangeString());
    }
    // TODO: test this
    async prependOneRowAfterHeader(row) {
        await this.spreadsheetService.rowsPrepend([row], this.sheetName, 'A', 1);
    }
    async prependOneMap(map) {
        const headerList = await this.waitingForHeaderList;
        const row = headerList.map((a) => map[a]);
        this.prependOneRowAfterHeader(row);
    }
    async replaceAllRowsIncludingHeader(rows) {
        await this.spreadsheetService.sheetClear(this.sheetName);
        const headerList = await this.waitingForHeaderList;
        rows.unshift(headerList);
        for (const r of rows) {
            await this.appendOneRow(r);
        }
    }
    async getAllRows({ 
    // if true, we get the first row as headers
    includeHeader = false, 
    // if there are values in this array, they correspond to headers and
    // therefore we return a data set with only the columns matching the header values in this array
    limitToHeaders = [], limitRows = 0 } = { includeHeader: false, limitToHeaders: [], limitRows: 0 }) {
        let dataList = await this.spreadsheetService.rangeGet(this.getSheetRangeString('A' + (includeHeader ? '1' : '2'), 'Z' + (limitRows ? String(limitRows) : '')));
        if (limitToHeaders.length) {
            const indexList = await this.getIndexesByHeaderValues(limitToHeaders);
            // now we make sure that there is no missing data! This should never happen
            for (const i of indexList) {
                if (i < 0) {
                    throw new Error(`We are missing a header value in ${limitToHeaders.join(', ')}`);
                }
            }
            dataList = dataList.reduce((all, row) => {
                all.push(indexList.map((i) => row[i]));
                return all;
            }, []);
        }
        return dataList || [];
    }
    async getAllRowsAsMaps({ 
    // if true, we get the first row as headers
    includeHeader = false, 
    // if there are values in this array, they correspond to headers and
    // therefore we return a data set with only the columns matching the header values in this array
    limitToHeaders = [], limitRows = 0 } = { includeHeader: false, limitToHeaders: [], limitRows: 0 }) {
        const headerList = await this.waitingForHeaderList;
        const rows = await this.getAllRows({
            includeHeader,
            limitToHeaders,
            limitRows
        });
        return rows.map((r) => ({
            ...headerList.reduce((a, b, i) => {
                if (!b)
                    return a;
                a[b] = r[i];
                return a;
            }, {})
        }));
    }
    async getMapsByMatchAnyProperties(query) {
        return (await this.getAllRowsAsMaps()).filter((map) => {
            return Object.keys(map).some((k) => query[k] && query[k] === map[k]);
        });
    }
    // this returns a list of index number corresponding to rows that match the query
    // inclusive of header! Starting with 1!
    async getIndexListByMatchAnyProperties(query) {
        const all = await this.getAllRowsAsMaps({ includeHeader: true });
        return all
            .map((map, i) => {
            return Object.keys(map).some((k) => query[k] && query[k] === map[k])
                ? i + 1
                : 0;
        })
            .filter((a) => a > 0);
    }
    async getIndexesByHeaderValues(a) {
        const headerList = await this.waitingForHeaderList;
        return a.map(headerList.indexOf);
    }
    getSheetRangeString(columnStart, columnEnd) {
        // this will return the sheet name alone unless parameters are passed.
        // if columnStart is passed it will add the column letter
        // if columnEnd is passed it will end the end column letter
        return `${this.sheetName}${columnStart ? '!' + columnStart : ''}${columnStart && columnEnd ? ':' + columnEnd : ''}`;
    }
    // this is called in the constructor to populate the headers
    // if the headers have changed, this will update them in the sheet before populating
    async getOrCreateHeaders(headerList) {
        await this.waitingForSheetId;
        let list = ((await this.spreadsheetService.rangeGet(this.getSheetRangeString('A1', 'Z1')))[0] || []);
        // if we past a header list
        if (headerList) {
            // the keys do NOT match, we throw an error
            if (!list.every((a, i) => {
                return headerList[i] === a;
            })) {
                throw new Error(`header list mismatch! The spreadsheet is out of sync with the model:

                the spreadsheet: ${list.join(', ')}
                the model:       ${headerList.join(', ')}

                `);
            }
            await this.spreadsheetService.rowsAppend([headerList], this.getSheetRangeString('A1', 'Z1'));
            list = headerList;
        }
        return list;
    }
}
exports.GoogleSheetService = GoogleSheetService;

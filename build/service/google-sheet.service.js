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
        return this.spreadsheetService.rowsWrite([[value]], this.getSheetRangeString(`A${index}`));
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
    async prependOneRow(row) {
        await this.spreadsheetService.rowsAppend([row], this.getSheetRangeString('A'));
    }
    async replaceAllRowsExceptHeader(rows) {
        await this.spreadsheetService.sheetClear(this.sheetName);
        this.waitingForHeaderList = this.getOrCreateHeaders();
        await Promise.all(rows.map(this.appendOneRow));
    }
    async getAllRows({ 
    // if true, we get the first row as headers
    includeHeader = false, 
    // if there are values in this array, they correspond to headers and
    // therefore we return a data set with only the columns matching the header values in this array
    limitToHeaders = [], limitRows = 0 } = { includeHeader: false, limitToHeaders: [], limitRows: 0 }) {
        let dataList = await this.spreadsheetService.rangeGet(this.getSheetRangeString('A' + (includeHeader ? 1 : 2), 'Z' + (limitRows ? limitRows : '')));
        if (limitToHeaders.length) {
            const indexList = await this.getIndexesByHeaderValues(limitToHeaders);
            // now we make sure that there is no missing data! This should never happen
            for (let i of indexList) {
                if (i < 0) {
                    throw new Error(`We are missing a header value in ${limitToHeaders.join(', ')}`);
                }
            }
            dataList = dataList.reduce((all, row) => {
                all.push(indexList.map((i) => row[i]));
                return all;
            }, []);
        }
        return dataList;
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
            ...r.reduce((a, b, i) => {
                a[headerList[i]] = b;
                return a;
            }, {})
        }));
    }
    async getMapsByMatchAnyProperties(query) {
        return (await this.getAllRowsAsMaps()).filter((map) => {
            return Object.keys(map).some((k) => query[k] === map[k]);
        });
    }
    // this returns a list of index number corresponding to rows that match the query
    // inclusive of header! Starting with 1!
    async getIndexListByMatchAnyProperties(query) {
        const all = await this.getAllRowsAsMaps({ includeHeader: true });
        return all
            .map((map, i) => {
            return Object.keys(map).some((k) => query[k] === map[k])
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
        let list = ((await this.spreadsheetService.rangeGet(this.getSheetRangeString('A', 'C')))[0] || []);
        // if we past a header list
        if (headerList) {
            // the keys do NOT match, we throw an error
            if (!list.every((a, i) => {
                list[i] === a;
            })) {
                throw new Error(`header list mismatch! The spreadsheet is out of sync with the model:

                the spreadsheet: ${list.join(', ')}
                the model:       ${headerList.join(', ')}

                `);
            }
            await this.spreadsheetService.rowsAppend([headerList], this.getSheetRangeString('A', 'A'));
            list = headerList;
        }
        return list;
    }
}
exports.GoogleSheetService = GoogleSheetService;
function matchs(a) {
    return (b) => !Object.keys(a).some((key) => a[key] !== b[key]);
}
function rowNameToModelKey(rowName) {
    const [first, ...rest] = rowName.split(/[_-\s]/g);
    return first + rest.map(capitlize).join('');
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
    const [area, sheet] = range.split('!').reverse();
    const [a, b] = area.split(':');
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
        b: parseCell(b)
    };
}

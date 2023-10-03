import {
    GoogleSpreadsheetsService,
    SpreadsheetDataModel,
    SpreadsheetDataValueModel
} from './google-spreadsheet.service';
interface SheetModel {
    spreadsheetId: string;
    sheetName: string;
    headersList?: string[];
}

export class GoogleSheetService<T extends SpreadsheetDataModel> {
    spreadsheetService: GoogleSpreadsheetsService;
    sheetName: string;

    // we can await this in the methods so we are sure the sheet exists
    waitingForSheetId: Promise<number>;
    headerList: (keyof T)[] = [];

    constructor({ spreadsheetId, sheetName, headersList }: SheetModel) {
        // store params
        this.spreadsheetService = new GoogleSpreadsheetsService(spreadsheetId);
        this.sheetName = sheetName;
        this.spreadsheetService.sheetCreateIfNone(this.sheetName);
        this.waitingForSheetId = this.spreadsheetService.getSheetIdByTitle(
            this.sheetName
        );
        this.getOrCreateHeaders(headersList as (keyof T)[]);
    }

    // TODO: test this
    async updateRowByIndex(index: number, value: SpreadsheetDataValueModel) {
        return this.spreadsheetService.rowsWrite(
            [[value]],
            this.getSheetRangeString(`A${index}`)
        );
    }

    // TODO: test this
    async appendOneRow(row: string[]) {
        await this.spreadsheetService.rowsAppend(
            [row],
            this.getSheetRangeString()
        );
    }
    // TODO: test this
    async appendOneMap(map: T) {
        const row = this.headerList.map(
            (a) => map[a] as SpreadsheetDataValueModel
        );
        await this.spreadsheetService.rowsAppend(
            [row],
            this.getSheetRangeString()
        );
    }

    // TODO: test this
    async prependOneRow(row: string[]) {
        await this.spreadsheetService.rowsAppend(
            [row],
            this.getSheetRangeString('A')
        );
    }

    async replaceAllRowsExceptHeader(rows: string[][]) {
        await this.spreadsheetService.sheetClear(this.sheetName);
        await this.getOrCreateHeaders();
        await Promise.all(rows.map(this.appendOneRow));
    }

    async getAllRows(
        {
            // if true, we get the first row as headers
            includeHeader = false,
            // if there are values in this array, they correspond to headers and
            // therefore we return a data set with only the columns matching the header values in this array
            limitToHeaders = [],
            limitRows = 0
        }: {
            includeHeader?: boolean;
            limitToHeaders?: (keyof T)[];
            limitRows?: number;
        } = { includeHeader: false, limitToHeaders: [], limitRows: 0 }
    ): Promise<SpreadsheetDataValueModel[][]> {
        const rangeLetter = includeHeader ? 'A' : 'B';
        let dataList = await this.spreadsheetService.rangeGet(
            this.getSheetRangeString(
                limitRows ? rangeLetter + 1 : rangeLetter,
                limitRows ? rangeLetter + limitRows : rangeLetter
            )
        );
        if (limitToHeaders.length) {
            const indexList = this.getIndexesByHeaderValues(limitToHeaders);

            // now we make sure that there is no missing data! This should never happen
            for (let i of indexList) {
                if (i < 0) {
                    throw new Error(
                        `We are missing a header value in ${limitToHeaders.join(
                            ', '
                        )}`
                    );
                }
            }
            dataList = dataList.reduce((all, row) => {
                all.push(indexList.map((i) => row[i]));
                return all;
            }, [] as SpreadsheetDataValueModel[][]);
        }

        return dataList;
    }

    async getAllRowsAsMaps(
        {
            // if true, we get the first row as headers
            includeHeader = false,
            // if there are values in this array, they correspond to headers and
            // therefore we return a data set with only the columns matching the header values in this array
            limitToHeaders = [],
            limitRows = 0
        }: {
            includeHeader?: boolean;
            limitToHeaders?: (keyof T)[];
            limitRows?: number;
        } = { includeHeader: false, limitToHeaders: [], limitRows: 0 }
    ): Promise<T[]> {
        const rows = await this.getAllRows({
            includeHeader,
            limitToHeaders,
            limitRows
        });

        return rows.map((r) => ({
            ...r.reduce((a, b, i) => {
                a[this.headerList[i] as string] =
                    b as SpreadsheetDataValueModel;
                return a;
            }, {} as { [k in string]: SpreadsheetDataValueModel })
        })) as T[];
    }

    async getMapsByMatchAnyProperties(query: Partial<T>): Promise<T[]> {
        return (await this.getAllRowsAsMaps()).filter((map) => {
            return Object.keys(map).some((k) => query[k] === map[k]);
        });
    }

    // this returns a list of index number corresponding to rows that match the query
    // inclusive of header! Starting with 1!
    async getIndexListByMatchAnyProperties(
        query: Partial<T>
    ): Promise<number[]> {
        const all = await this.getAllRowsAsMaps({ includeHeader: true });
        return all
            .map((map, i) => {
                return Object.keys(map).some((k) => query[k] === map[k])
                    ? i + 1
                    : 0;
            })
            .filter((a) => a > 0);
    }

    getIndexesByHeaderValues(a: (keyof T)[]) {
        return a.map(this.headerList.indexOf);
    }

    getSheetRangeString(columnStart?: string, columnEnd?: string) {
        // this will return the sheet name alone unless parameters are passed.
        // if columnStart is passed it will add the column letter
        // if columnEnd is passed it will end the end column letter
        return `${this.sheetName}!${columnStart ? columnStart : ''}${
            columnStart && columnEnd ? ':' + columnStart : ''
        }`;
    }
    // this is called in the constructor to populate the headers
    // if the headers have changed, this will update them in the sheet before populating
    async getOrCreateHeaders(headerList?: (keyof T)[]): Promise<(keyof T)[]> {
        await this.waitingForSheetId;
        this.headerList = ((
            await this.spreadsheetService.rangeGet(
                this.getSheetRangeString('A', 'A')
            )
        )[0] || []) as (keyof T)[];

        // if we past a header list

        if (headerList) {
            // the keys do NOT match, we throw an error
            if (
                !this.headerList.every((a, i) => {
                    this.headerList[i] === a;
                })
            ) {
                throw new Error(`header list mismatch! The spreadsheet is out of sync with the model:

                the spreadsheet: ${this.headerList.join(', ')}
                the model:       ${headerList.join(', ')}

                `);
            }
            await this.spreadsheetService.rowsAppend(
                [headerList as (string | number)[]],
                this.getSheetRangeString('A', 'A')
            );
            this.headerList = headerList;
        }
        return this.headerList;
    }

    // async getRowsWhereValueMatches(Partial<T>)
    // :DataValueType[][]
    // {
    //     return []
    // };

    // async search(partial: Partial<T>) {
    //     const values = await this.get();
    //     return values.find(matchs(partial));
    // }

    // async filter(partial: Partial<T>) {
    //     const values = await this.get();
    //     return values.filter(matchs(partial));
    // }

    // async searchIndex(partial: Partial<T>) {
    //     const values = await this.get();
    //     return values.findIndex(matchs(partial));
    // }

    // async update(source: Partial<T>, update: Partial<T>) {
    //     // get complete item and update it
    //     const full = await this.search(source);
    //     if (!full) throw new Error('Can not find item to update');
    //     const row = this.valueToRow({ ...full, ...update });

    //     // get the range so that we can update it
    //     const range = await this.getRangeForItem(source);

    //     // update the spread sheet
    //     const [gspread] = await Gspread;
    //     await gspread.spreadsheets.values.update({
    //         spreadsheetId: this.spreadsheetId,
    //         valueInputOption: 'USER_ENTERED',
    //         range,
    //         requestBody: { values: [row] }
    //     });

    //     // update the cache
    //     await this.updateCache();
    // }

    // async getRangeForItem(value: Partial<T>) {
    //     // parse the range so the we can figure out the row for the element
    //     const range = a1RangeToGridRange(this.range);

    //     // if no start row is provided, then that means its 1
    //     range.a.row = range.a.row ?? 1;

    //     // move down to the row of the value
    //     const index = await this.searchIndex(value);
    //     range.a.row += index + 1; // move past header

    //     // and make it the end row as well
    //     range.b.row = range.a.row;

    //     // convert back to a1 range and return
    //     return gridRangeToA1Range(range);
    // }

    // valueToRow(value: T): any[] {
    //     return this.header.map((name) => value[name] ?? '');
    // }

    // async append(values: T[]) {
    //     // turn the models into rows
    //     const rows = values.map((value) => this.valueToRow(value));

    //     // append the rows to the sheet
    //     const [gspread] = await Gspread;
    //     await gspread.spreadsheets.values.append({
    //         spreadsheetId: this.spreadsheetId,
    //         range: this.range,
    //         valueInputOption: 'USER_ENTERED',
    //         requestBody: { values: rows }
    //     });

    //     // update the cache
    //     await this.updateCache();
    // }
}

function matchs<T extends Partial<Record<string, any>>>(a: Partial<T>) {
    return (b: T) => !Object.keys(a).some((key) => a[key] !== b[key]);
}

function rowNameToModelKey(rowName: string): string {
    const [first, ...rest] = rowName.split(/[_-\s]/g);
    return first + rest.map(capitlize).join('');
}

function capitlize(word: string) {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}

function empty(item: Record<string, string>) {
    return Object.values(item).some((value) => !!value);
}

interface GridRange {
    sheet: string;
    a: {
        col: string;
        row?: number;
    };
    b: {
        col: string;
        row?: number;
    };
}

function gridRangeToA1Range(r: GridRange): string {
    return `${r.sheet}!${r.a.col}${r.a.row ?? ''}:${r.b.col}${r.b.row ?? ''}`;
}

function a1RangeToGridRange(range: string): GridRange {
    const [area, sheet] = range.split('!').reverse();
    const [a, b] = area.split(':');

    function parseCell(cell: string) {
        if (!cell) throw new Error(`Invalid a1range ${range}!`);
        const matchs = cell.match(/([A-Z]+)(\d*)/);
        const col = matchs?.at(1);
        if (!col) throw new Error(`Invalid a1range ${range}!`);
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

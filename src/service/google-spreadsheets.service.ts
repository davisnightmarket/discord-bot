import { GoogleAuth } from 'google-auth-library';
import { google, type sheets_v4 } from 'googleapis';
import { GetNmSecrets } from '../utility/nm-secrets.utility';

const DEAFULT_CACHE_TIME = 1000 * 60 * 60; // default to one hour

const Gspread = GetNmSecrets().then((keys) => {
    const credentials = keys.googleSpreadsheetsKeys;
    const auth = new GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });

    return [google.sheets({ version: 'v4', auth }), auth] as [
        sheets_v4.Sheets,
        GoogleAuth
    ];
});

interface SheetConfig {
    sheetId: string;
    range: string;
    cacheTime?: number;
}

export class Sheet<T extends Record<string, any>> {
    spreadsheetId: string;
    range: string;
    cache: T[] = [];
    cacheLastUpdated: number = 0;
    cacheTime: number;
    header: Array<keyof T> = [];

    constructor(config: SheetConfig) {
        this.spreadsheetId = config.sheetId;
        this.range = config.range;
        this.cacheTime = config.cacheTime ?? DEAFULT_CACHE_TIME;

        this.updateCache();
    }

    async get(): Promise<T[]> {
        if (this.cacheLastUpdated + this.cacheTime < Date.now()) {
            await this.updateCache()
        }

        return this.cache.filter(empty)
    }

    async search(partial: Partial<T>) {
        const values = await this.get()
        return values.find(matchs(partial))
    }

    async searchIndex(partial: Partial<T>) {
        const values = await this.get()
        return values.findIndex(matchs(partial))
    }

    async update(source: T, update: Partial<T>) {
        const key = await this.getRangeForItem(source);
        const row = this.valueToRow({ ...source, ...update });

        // update the spread sheet
        const [gspread] = await Gspread;
        await gspread.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            valueInputOption: 'USER_ENTERED',
            range: key,
            requestBody: { values: [ row ] }
        });

        // update the cache
        await this.updateCache();
    }

    async getRangeForItem(value: T) {
        // parse the range so the we can figure out the row for the element
        const range = a1RangeToGridRange(this.range); 

        // if no start row is provided, then that means its 1
        range.a.row = range.a.row ?? 1;

        // move down to the row of the value
        const index = await this.searchIndex(value)
        range.a.row += index + 1 // move past header

        // and make it the end row as well
        range.b.row = range.a.row

        // convert back to a1 range and return
        return gridRangeToA1Range(range)
    }

    valueToRow(value: T): any[] {
        return this.header.map((name) => value[name] ?? '') 
    }

    async append(values: T[]) {
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
        if (!result.data.values) throw new Error("!!!");


        // update the cache using the headers in the range to map to build the model
        const [header, ...rows] = result.data.values;
        this.header = header.map(rowNameToModelKey) as Array<keyof T>;
        this.cache = rows
            .map((row) => {
                const a: Partial<T> = {}
                for (let i = 0; i < this.header.length; i++) {
                    a[this.header[i]] = row[i] ?? ''
                }
                return a as T
            })

        // the last time is was updated was right now!
        this.cacheLastUpdated = Date.now();
    }
}

function matchs<T extends Partial<Record<string, any>>>(a: Partial<T>) {
    return (b: T) => Object.keys(a).some((key) => a[key] === b[key])
}

function rowNameToModelKey(rowName: string): string {
    const [first, ...rest] = rowName.split(/[_-\s]/g)
    return first + rest.map(capitlize).join("")
}

function capitlize(word: string) {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}

function empty(item: Record<string, string>) {
    return Object.values(item).some((value) => !!value)
}

interface GridRange {
    sheet: string,
    a: {
        col: string,
        row?: number,  
    },
    b: {
        col: string,
        row?: number,
    }
}

function gridRangeToA1Range(r: GridRange): string {
    return `${r.sheet}!${r.a.col}${r.a.row ?? ''}:${r.b.col}${r.b.row ?? ''}`
}

function a1RangeToGridRange(range: string): GridRange {
    const [area, sheet] = range.split("!").reverse()
    const [a, b] = area.split(":")

    function parseCell(cell: string) {
        if (!cell) throw new Error(`Invalid a1range ${range}!`)
        const matchs = cell.match(/([A-Z]+)(\d*)/);
        const col = matchs?.at(1);
        if (!col) throw new Error(`Invalid a1range ${range}!`)
        const row = matchs?.at(2);
        return {
            col,
            row: row ? parseInt(row) : undefined 
        }
    }

    return {
        sheet,
        a: parseCell(a),
        b: parseCell(b),
    }
}

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

export class Sheet<T> {
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

        return this.cache
    }

    async append(values: T[]) {
        // if no header, the we need to update the cache
        if (this.header.length === 0) await this.updateCache()

        // turn the models into rows
        const rows = values.map((value) => this.header.map((name) => value[name] ?? ''));

        // append the rows to the sheet
        const [gspread] = await Gspread;
        const req = await gspread.spreadsheets.values.append({
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
            .filter((row) => row.length !== 0) // exclude empty rows
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

function rowNameToModelKey(rowName: string): string {
    const [first, ...rest] = rowName.split(/[_-\s]/g)
    return first + rest.map(capitlize).join("")
}

function capitlize(word: string) {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}

import { GoogleAuth } from 'google-auth-library';
import { google, type sheets_v4 } from 'googleapis';
import { Dbg } from '../utility';
import { GetNmSecrets } from '../utility/nm-secrets.utility';

const dbg = Dbg('GoogleSpreadsheetsService');

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

    constructor(config: SheetConfig) {
        this.spreadsheetId = config.sheetId;
        this.range = config.range;
        this.cacheTime = config.cacheTime ?? 1000 * 60 * 60; // default to one hour
    }


    async get(): Promise<T[]> {
        if (this.cacheLastUpdated + this.cacheTime < Date.now()) {
            this.updateCache()
        }

        return this.cache
    }

    async add(values: T[]) {
    }

    async update(values: T[]) {
    }

    async remove(values: T[]) {}
    
    async updateCache() {
        // get the data from the spreed sheet
        const [gspread] = await Gspread;
        const result = await gspread.spreadsheets.values.get(this);
        if (!result.data.values) throw new Error("!!!");

        // update the cache using the headers in the range to map to build the model
        const [headers, ...rows] = result.data.values;
        this.cache = rows
            .filter((row) => row.length !== 0) // exclude empty rows
            .map((row) => {
                const a: Partial<T> = {}
                for (let i = 0; i < headers.length; i++) {
                    a[rowNameToModelKey(headers[i]) as keyof T] = row[i] ?? ''
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
    return word.charAt(0) + word.substring(1);
}

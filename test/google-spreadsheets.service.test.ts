import { describe, expect, test, beforeAll } from '@jest/globals';
import {
    GoogleSpreadsheetsService,
    Alphabet
} from '../src/service/google-spreadsheets.service';

//import { GSPREAD_SHEET_INVENTORY_HEADERS } from '../src/nm-const';
import { ConfigCoreGet } from '../src/utility';
let coreGoogSpread: GoogleSpreadsheetsService;

beforeAll(async () => {
    coreGoogSpread = new GoogleSpreadsheetsService(
        (await ConfigCoreGet('test')).GSPREAD_CORE_PERSON_ID
    );
});

describe('gspread.service.ts', () => {
    test('does a sheet exist', async () => {
        const a = await coreGoogSpread.sheetExists('person');

        expect(a).toBe(true);
    });

    test('does a sheet NOT exist', async () => {
        const a = await coreGoogSpread.sheetExists('person123');

        expect(a).toBe(false);
    });

    test('make sure our alphabet function works', () => {
        expect(Alphabet[0]).toBe('A');
        expect(Alphabet[25]).toBe('Z');
    });

    test('make sure our alphabet index method works', () => {
        expect(coreGoogSpread.columnIndexFromLetter('A')).toBe(0);
        expect(coreGoogSpread.columnIndexFromLetter('Z')).toBe(25);
    });

    test('can we DESTOY a sheet if it exists', async () => {
        if (await coreGoogSpread.sheetExists('abc-test')) {
            const b = coreGoogSpread.sheetDestroy('abc-test');
            expect(b).toBe(true);
        }
    });

    let a: boolean;
    test('can we CREATE a sheet', async () => {
        a = await coreGoogSpread.sheetCreate('abc-test');
        expect(a).toBe(true);
    });

    let c: string[][];
    test('can we ADD ROWS to a sheet', async () => {
        await coreGoogSpread.rowsAppend([['hi', 'there']], 'abc-test');
        c = await coreGoogSpread.rangeGet('abc-test!A:B');
        expect(c[0][0]).toBe('hi');
        expect(c[0][1]).toBe('there');

        await coreGoogSpread.rowsAppend([['hello', 'again']], 'abc-test');
        const d = await coreGoogSpread.rangeGet('abc-test!A:B');
        await coreGoogSpread.rowsDelete(
            1,
            2,
            await coreGoogSpread.getSheetIdByName('abc-test')
        );
        expect(d.length).toBe(c.length + 1);
    });

    test('can we DELETE ROWS from a sheet', async () => {
        const d = await coreGoogSpread.rangeGet('abc-test!A:B');
        await coreGoogSpread.rowsDelete(
            1,
            2,
            await coreGoogSpread.getSheetIdByName('abc-test')
        );
        expect(d.length).toBe(c.length);
    });

    test('can we DELETE  a sheet', async () => {
        if (a) {
            const b = await coreGoogSpread.sheetDestroy('abc-test');
            expect(b).toBe(true);
        }
    });
});

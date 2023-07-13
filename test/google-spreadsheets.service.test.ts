import { describe, expect, test } from '@jest/globals';
import { coreSheetService } from './test-services';

describe('gspread.service.ts', () => {
    test('does a sheet exist', async () => {
        const a = await coreSheetService.sheetExists('person');

        expect(a).toBe(true);
    });

    test('does a sheet NOT exist', async () => {
        const a = await coreSheetService.sheetExists('person123');

        expect(a).toBe(false);
    });

    test('can we DESTOY a sheet if it exists', async () => {
        if (await coreSheetService.sheetExists('abc-test')) {
            const b = coreSheetService.sheetDestroy('abc-test');
            expect(b).toBe(true);
        }
    });

    let a: boolean;
    test('can we CREATE a sheet', async () => {
        a = await coreSheetService.sheetCreate('abc-test');
        expect(a).toBe(true);
    });

    let c: string[][];
    test('can we ADD ROWS to a sheet', async () => {
        await coreSheetService.rowsAppend([['hi', 'there']], 'abc-test');
        c = await coreSheetService.rangeGet('abc-test!A:B');
        expect(c[0][0]).toBe('hi');
        expect(c[0][1]).toBe('there');

        await coreSheetService.rowsAppend([['hello', 'again']], 'abc-test');
        const d = await coreSheetService.rangeGet('abc-test!A:B');
        await coreSheetService.rowsDelete(
            1,
            2,
            await coreSheetService.getSheetIdByName('abc-test')
        );
        expect(d.length).toBe(c.length + 1);
    });

    test('can we DELETE ROWS from a sheet', async () => {
        const d = await coreSheetService.rangeGet('abc-test!A:B');
        await coreSheetService.rowsDelete(
            1,
            2,
            await coreSheetService.getSheetIdByName('abc-test')
        );
        expect(d.length).toBe(c.length);
    });

    test('can we DELETE  a sheet', async () => {
        if (a) {
            const b = await coreSheetService.sheetDestroy('abc-test');
            expect(b).toBe(true);
        }
    });
});

import { describe, expect, test, jest, beforeAll } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';
import { GoogleSpreadsheetsService } from '../../src/service';

jest.setTimeout(20000);

const spreadsheetsService = new GoogleSpreadsheetsService(
    '1kksf6xpjgz5wutszinKGOGrZesNz4mp0AKzXp9YXcas'
);

describe('GooglespreadsheetsService', () => {
    beforeAll(async () => {
        await WaitForGuildServices;
    });

    test('test create sheet on construct', async () => {
        await spreadsheetsService.sheetCreateIfNone('test');
        await spreadsheetsService.sheetClear('test');
        const sheetNameList = await spreadsheetsService.getSheetTitleList();
        expect(sheetNameList.includes('test')).toBe(true);
    });
    test('test rowsAppend', async () => {
        await spreadsheetsService.rowsAppend(
            [
                ['a', 'b', 'c'],
                [1, 2, 3]
            ],
            'test'
        );
        let rows = await spreadsheetsService.rangeGet('test!A:Z');
        expect(rows.length).toBe(2);
        await spreadsheetsService.rowsAppend(
            [
                ['d', 'e', 'f'],
                ['4', '5', '6']
            ],
            'test'
        );
        rows = await spreadsheetsService.rangeGet('test!A:Z');
        expect(rows.length).toBe(4);
        expect(rows[2][0]).toBe('d');
    });

    test('test spreadsheetsService.rowsAppend preAppend', async () => {
        await spreadsheetsService.rowsPrepend(
            [['HELLO'], ['there', 'person']],
            'test',
            'A',
            1
        );
        let rows = await spreadsheetsService.rangeGet('test!A:Z');
        expect(rows.length).toBe(6);
        expect(rows[1][0]).toBe('HELLO');
        expect(rows[2][1]).toBe('person');
    });

    test('test spreadsheetsService.sheetClear', async () => {
        await spreadsheetsService.sheetClear('test');
        let rows = await spreadsheetsService.rangeGet('test');
        expect(rows.length).toBe(0);
    });
});

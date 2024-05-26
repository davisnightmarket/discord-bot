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
        const sheetNameList = await spreadsheetsService.getSheetTitleList();
        expect(sheetNameList.includes('test')).toBe(true);
    });

    test('test rowsAppend and prepend', async () => {
        await spreadsheetsService.sheetClear('test');
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

        await spreadsheetsService.rowsPrepend(
            [['HELLO'], ['there', 'person']],
            'test',
            'A',
            1
        );

        let rowsPrepend = await spreadsheetsService.rangeGet('test!A:Z');
        console.log(rowsPrepend);
        expect(rowsPrepend[1][0]).toBe('HELLO');
        expect(rowsPrepend[2][1]).toBe('person');
    });

    test('test spreadsheetsService.sheetClear', async () => {
        await spreadsheetsService.sheetClear('test');
        let rows = await spreadsheetsService.rangeGet('test');
        expect(rows.length).toBe(0);
    });
});

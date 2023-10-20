import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';
import { GoogleSheetService } from '../../src/service';

jest.setTimeout(20000);

const sheetService = new GoogleSheetService({
    spreadsheetId: '1kksf6xpjgz5wutszinKGOGrZesNz4mp0AKzXp9YXcas',
    sheetName: 'test',
    headersList: ['a', 'b', 'c']
});

describe('GoogleSheetService', () => {
    test('test getOrCreateHeaders', async () => {
        await WaitForGuildServices;
        await sheetService.createHeaders();
        const headers = await sheetService.waitingForHeaderList;
        expect(headers.length).toBe(3);
    });

    test('test updateRowByRowNumber', async () => {
        await WaitForGuildServices;
        await sheetService.updateRowByRowNumber(2, ['hi', 'there', 'person']);
        await sheetService.updateRowByRowNumber(3, ['how', 'are', 'you']);
        await sheetService.updateRowByRowNumber(4, ['how', 'are', 'you']);
        await sheetService.updateRowByRowNumber(5, ['great!', 'so', 'glad']);
        let rows = await sheetService.getAllRows({
            includeHeader: true
        });
        expect(rows.length).toBe(5);
        await sheetService.updateRowByRowNumber(4, ['i', 'am', 'fine']);
        rows = await sheetService.getAllRows({
            includeHeader: true
        });
        expect(rows.length).toBe(5);
        expect(rows[3][2]).toBe('fine');
        expect(rows[4][2]).toBe('glad');
    });
});

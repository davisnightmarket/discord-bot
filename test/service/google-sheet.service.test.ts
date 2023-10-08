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
        await sheetService.getOrCreateHeaders();
        const headers = await sheetService.waitingForHeaderList;
        expect(headers.length).toBe(3);
    });
});

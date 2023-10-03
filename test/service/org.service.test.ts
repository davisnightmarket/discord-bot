import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(20000);

describe('NightMarketDataService', () => {
    test('gets the list of orgs from central spreadsheet', async () => {
        const { orgCoreService } = await WaitForGuildServices;
        const orgList = await orgCoreService.getOrgList();
        expect(orgList.length).toBeGreaterThan(3);
    });
});

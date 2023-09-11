import { describe, expect, test, jest } from '@jest/globals';
import { orgCoreService } from './test-services'

jest.setTimeout(20000);

describe('NightMarketDataService', () => {
    test('gets the list of orgs from central spreadsheet', async () => {
        const orgList = await orgCoreService.getOrgList();
        expect(orgList.length).toBeGreaterThan(3);
    });
});

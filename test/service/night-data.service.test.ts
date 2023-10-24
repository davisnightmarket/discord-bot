import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(20000);

describe('nightDataService', () => {
    test('gets the list of night data from market', async () => {
        const { nightDataService } = await WaitForGuildServices;
        const sundayNightList = await nightDataService.getNightDataByDay(
            'sunday'
        );
        expect(sundayNightList.length).toBe(0);
        const mondayNightList = await nightDataService.getNightDataByDay(
            'monday'
        );
        expect(mondayNightList.length).toBeGreaterThan(1);
    });
});

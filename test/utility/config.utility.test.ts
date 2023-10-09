import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(10000);

describe('nm-config.utility.ts', () => {
    test('make sure our GetConfigByGuildId function works', async () => {
        const { coreDataService } = await WaitForGuildServices;
        const a = await coreDataService.getConfigByGuildId(
            '1094663742559625367'
        );
        expect(Object.keys(a).length).toBe(8);
    });
});

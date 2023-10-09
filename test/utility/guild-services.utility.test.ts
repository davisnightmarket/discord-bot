import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(5000);

describe('nm-secrets.utility.ts', () => {
    test('make sure our GuildServices function works', async () => {
        const g = await WaitForGuildServices;
        expect(typeof g.foodCountDataService).toBe('object');
    });
});

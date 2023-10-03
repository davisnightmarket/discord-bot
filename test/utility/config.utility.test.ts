import { describe, expect, test, jest } from '@jest/globals';
import { GetConfigByGuildId } from '../../src/utility';
GetConfigByGuildId;
jest.setTimeout(10000);

describe('nm-config.utility.ts', () => {
    test('make sure our GetConfigByGuildId function works', async () => {
        const a = await GetConfigByGuildId('1094663742559625367');
        expect(Object.keys(a).length).toBe(8);
    });
});

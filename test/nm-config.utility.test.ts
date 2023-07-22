import { describe, expect, test, jest } from '@jest/globals';
import { config } from './test-services';

jest.setTimeout(10000);

describe('nm-config.utility.ts', () => {
    test('make sure our GetConfigByGuildId function works', async () => {
        const a = await config.getConfigForGuildId('1094663742559625367');
        expect(Object.keys(a).length).toBe(8);
    });
});

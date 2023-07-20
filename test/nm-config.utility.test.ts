import { describe, expect, test, jest } from '@jest/globals';
import { GetInstanceConfigMap, GetConfigByGuildId } from '../src/utility';
import { EnvConfig } from '../src/config';
import { EnvType } from '../src/model';

jest.setTimeout(10000);

describe('nm-config.utility.ts', () => {
    // to run this, set the NODE_ENV to prod when running Jest
    // and make sure you are using a service account with secrets access
    console.log(EnvConfig[process.env.NODE_ENV as EnvType]);
    test('make sure our GetInstanceConfigMap function works', async () => {
        const a = await GetInstanceConfigMap();
        expect(Object.keys(a).length).toBeGreaterThan(0);
        expect(Object.keys(a['usa.ca.davis']).length).toBe(4);
    });

    test('make sure our GetConfigByGuildId function works', async () => {
        // this is the test guild id
        const a = await GetConfigByGuildId('1094663742559625367');
        expect(Object.keys(a).length).toBe(8);
    });
});

import { describe, expect, test, jest } from '@jest/globals';
import { GetAwsSecretsConfig } from '../../src/utility';

jest.setTimeout(5000);

describe('nm-secrets.utility.ts', () => {
    // to run this, set the NODE_ENV to prod when running Jest
    // and make sure you are using a service account with secrets access
    test('make sure our GetAwsSecretsConfig function works', async () => {
        let a = await GetAwsSecretsConfig();
        expect(Object.keys(a.discordApiConfig).length).toBe(2);
        expect(Object.keys(a.googleApiConfig).length).toBe(11);
        expect(Object.keys(a.pgConfig).length).toBe(5);
    });
});

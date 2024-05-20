import { describe, expect, test, jest } from '@jest/globals';
import { GetAwsSecret } from '../../src/utility';

jest.setTimeout(5000);

describe('nm-secrets.utility.ts', () => {
    // to run this, set the NODE_ENV to prod when running Jest
    // and make sure you are using a service account with secrets access
    test('make sure our GoogleSecretService function works', async () => {
        let a = await GetAwsSecret('nm-discord-api', 'test');
        expect(Object.keys(a).length).toBe(2);
        a = await GetAwsSecret('nm-discord-api', 'prod');
        expect(Object.keys(a).length).toBe(2);
    });
});

import { describe, expect, test, jest } from '@jest/globals';
import { GetGoogleSecrets, GetNmSecrets } from '../src/utility';

jest.setTimeout(5000);

describe('nm-secrets.utility.ts', () => {
    // to run this, set the NODE_ENV to prod when running Jest
    // and make sure you are using a service account with secrets access
    if (process.env.NODE_ENV === 'prod') {
        test('make sure our GoogleSecretService function works', async () => {
            const a = await GetGoogleSecrets<{ hi: string }>(
                'nm-config-test-api'
            );
            expect(a.hi).toBe('there');
        });
    } else {
        test('make sure our NmConfigService works locally', async () => {
            const a = await GetNmSecrets();
            expect(Object.keys(a).length).toBe(2);
        });
    }
});

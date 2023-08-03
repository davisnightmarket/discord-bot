import { describe, expect, test, jest } from '@jest/globals';
import { personCoreService } from './test-services';

jest.setTimeout(20000);

describe('nm-person.service', () => {
    test('update a person active status in central spreadsheet', async () => {
        const email = 'christianco@gmail.com'

        await personCoreService.setActiveState(email, 'inactive');
        const pa = await personCoreService.getPerson({ email });
        expect(pa?.status).toBe('inactive')

        await personCoreService.setActiveState(email, 'active');
        const pb = await personCoreService.getPerson({ email });
        expect(pb?.status).toBe('active')
    });
});

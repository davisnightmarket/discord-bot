import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(20000);

describe('nm-person.service', () => {
    test('update a person active status in central spreadsheet', async () => {
        const { personDataService } = await WaitForGuildServices;
        const email = 'christianco@gmail.com';
        await personDataService.setActiveState(email, 'inactive');

        
        const pa = await personDataService.getPersonByEmailOrDiscordId(email);
        expect(pa?.email).toBe(email);
        expect(pa?.status).toBe('inactive');

        await personDataService.setActiveState(email, 'active');
        await personDataService.refreshPersonListCache();
        const pb = await personDataService.getPersonByEmailOrDiscordId(email);
        expect(pb?.status).toBe('active');
    });
});

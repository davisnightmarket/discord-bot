import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(20000);

describe('nm-person.service', () => {
    test('update a person active status in central spreadsheet', async () => {
        const { personSheetService } = await WaitForGuildServices;
        const email = 'christianco@gmail.com';
        await personSheetService.setActiveState(email, 'inactive');

        const pa = await personSheetService.getPersonByEmailOrDiscordId(email);
        expect(pa?.email).toBe(email);
        expect(pa?.status).toBe('inactive');

        await personSheetService.setActiveState(email, 'active');
        await personSheetService.refreshPersonListCache();
        const pb = await personSheetService.getPersonByEmailOrDiscordId(email);
        expect(pb?.status).toBe('active');
    });
});

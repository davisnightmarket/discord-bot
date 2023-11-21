import { describe, expect, test } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';
describe('MessageService', () => {
    test('gets a single message', async () => {
        const { markdownService } = await WaitForGuildServices;
        const a = markdownService.getNightOpsAnnounce('a', {
            day: 'monday',
            org: '',
            timeStart: '',
            timeEnd: '',
            statusList: [],
            hostList: [],
            pickupList: [
                {
                    day: 'monday',
                    org: 'Coop',
                    timeStart: '6:00',
                    timeEnd: '',
                    role: 'night-pickup',
                    periodStatus: 'ALWAYS',
                    discordIdOrEmail: '',
                    personList: [],
                    noteList: []
                }
            ]
        });
        expect(a.trim()).toBe(`## Dear <@&a>!

Night Cap NEEDED!
Distro help NEEDED!
Pick-up: 
> Coop 6:00 AM 

 Love, Crabapple`);
    });
});

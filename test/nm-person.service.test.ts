import { describe, expect, test, jest } from '@jest/globals';
import { personCoreService } from './test-services';

jest.setTimeout(20000);

describe('nm-person.service', () => {
    // test('make sure we can get a column range', async () => {
    //     expect(NmPersonService.getColumnRangeName('DISCORD_ID')).toBe(
    //         'person!N'
    //     );
    //     expect(NmPersonService.getColumnRangeName('STATUS', 3)).toBe(
    //         'person!A3'
    //     );
    //     expect(NmPersonService.getColumnRangeName('EMAIL')).toBe('person!C');
    //     expect(NmPersonService.getColumnRangeName('EMAIL', 1, 'F')).toBe(
    //         'person!C1:F'
    //     );
    // });

    test('update a person active status in central spreadsheet', async () => {
        const a = await personCoreService.setActiveState(
            'christianco@gmail.com',
            'active'
        );

        expect(a).toBe('person!A34');
    });
});

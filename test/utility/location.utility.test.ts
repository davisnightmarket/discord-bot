import { describe, expect, test } from '@jest/globals';
import { LocationService } from '../../src/service';

describe('utility/tz.utility.ts', () => {
    test('GetTzOffset', () => {
        expect(
            LocationService.getTimeZoneOffsetInSeconds('America/Denver')
        ).toBe(420);
        expect(
            LocationService.getTimeZoneOffsetInSeconds('America/Los_Angeles')
        ).toBe(480);
        expect(
            LocationService.getTimeZoneOffsetInSeconds('Africa/Monrovia')
        ).toBe(0);
    });
});

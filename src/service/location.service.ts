import tzOffset, { Timezone } from 'tz-offset';
import NodeGeocoder, { Geocoder, Options } from 'node-geocoder';

export class LocationService {
    geocoder: Geocoder;
    constructor(private config: Options) {
        this.geocoder = NodeGeocoder(this.config);
    }

    async getLatLonFromAddress(address: string) {
        const res = await this.geocoder.geocode(address);
        if (res.length) {
        }
    }

    static getTimeZoneOffsetInSeconds(tz: Timezone): number {
        return tzOffset.offsetOf(tz);
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const tz_offset_1 = __importDefault(require("tz-offset"));
const node_geocoder_1 = __importDefault(require("node-geocoder"));
class LocationService {
    constructor(config) {
        this.config = config;
        this.geocoder = (0, node_geocoder_1.default)(this.config);
    }
    async getLatLonFromAddress(address) {
        const res = await this.geocoder.geocode(address);
        if (res.length) {
        }
    }
    static getTimeZoneOffsetInSeconds(tz) {
        return tz_offset_1.default.offsetOf(tz);
    }
}
exports.LocationService = LocationService;

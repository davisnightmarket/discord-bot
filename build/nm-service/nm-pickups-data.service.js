"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmPickupsDataService = void 0;
const service_1 = require("../service");
class NmPickupsDataService {
    constructor(config) {
        this.pickupsSheetService = new service_1.Sheet({
            sheetId: config.GSPREAD_CORE_PICKUPS_ID,
            range: 'pickups!A1:I'
        });
    }
    async getAllPickups() {
        return await this.pickupsSheetService.get();
    }
    async getPickupsFor(day) {
        return await this.getAllPickups().then((pickups) => pickups
            .filter((pickup) => pickup.day === day)
            .filter((pickup) => pickup.activity === 'food pickup'));
    }
    async updateCache() {
        await this.pickupsSheetService.updateCache();
    }
}
exports.NmPickupsDataService = NmPickupsDataService;

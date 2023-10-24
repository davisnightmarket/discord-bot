"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMarketService = void 0;
const _1 = require(".");
class AdminMarketService {
    constructor(spreadsheetId, personDataService) {
        this.personDataService = personDataService;
        this.adminSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'admin'
        });
    }
    async getCommunityCoordinatorList() {
        const rows = (await this.adminSheetService.getAllRowsAsMaps()).map((a) => a.communityCoordinator);
        return await Promise.all(rows.map(this.personDataService.getPersonByEmailOrDiscordId));
    }
}
exports.AdminMarketService = AdminMarketService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketAdminService = void 0;
const _1 = require(".");
class MarketAdminService {
    constructor(spreadsheetId, personDataService) {
        this.personDataService = personDataService;
        this.adminSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'admin'
        });
    }
    async getCommunityCoordinatorList() {
        const rows = (await this.adminSheetService.getAllRowsAsMaps()).map((a) => a.communityCoordinator);
        return await Promise.all(rows.map((a) => this.personDataService.getPersonByEmailOrDiscordId(a)));
    }
    async getCommunityCoordinatorDiscordIdList() {
        const list = await this.getCommunityCoordinatorList();
        return list.map((a) => a?.discordId).filter((a) => a);
    }
}
exports.MarketAdminService = MarketAdminService;

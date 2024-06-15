"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmAdminService = void 0;
const _1 = require(".");
class NmAdminService {
    constructor(spreadsheetId, personSheetService) {
        this.personSheetService = personSheetService;
        this.adminSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'admin'
        });
    }
    async getCommunityCoordinatorList() {
        const rows = (await this.adminSheetService.getAllRowsAsMaps()).map((a) => a.communityCoordinator);
        return await Promise.all(rows.map(this.personSheetService.getPersonByEmailOrDiscordId));
    }
    async getCommunityCoordinatorDiscordIdList() {
        const list = await this.getCommunityCoordinatorList();
        return list.map((a) => a?.discordId).filter((a) => a);
    }
}
exports.NmAdminService = NmAdminService;

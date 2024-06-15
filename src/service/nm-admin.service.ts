import { GoogleSheetService, PersonSheetService } from '.';

export class NmAdminService {
    private readonly adminSheetService: GoogleSheetService<{
        communityCoordinator: string;
    }>;

    constructor(
        spreadsheetId: string,
        private readonly personSheetService: PersonSheetService
    ) {
        this.adminSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: 'admin'
        });
    }

    async getCommunityCoordinatorList() {
        const rows = (await this.adminSheetService.getAllRowsAsMaps()).map(
            (a) => a.communityCoordinator
        );
        return await Promise.all(
            rows.map(this.personSheetService.getPersonByEmailOrDiscordId)
        );
    }

    async getCommunityCoordinatorDiscordIdList() {
        const list = await this.getCommunityCoordinatorList();
        return list.map((a) => a?.discordId).filter((a) => a);
    }
}

import { GoogleSheetService, PersonDataService } from '.';

export class MarketAdminService {
    private readonly adminSheetService: GoogleSheetService<{
        communityCoordinator: string;
    }>;

    constructor(
        spreadsheetId: string,
        private personDataService: PersonDataService
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
            rows.map((a) =>
                this.personDataService.getPersonByEmailOrDiscordId(a)
            )
        );
    }

    async getCommunityCoordinatorDiscordIdList() {
        const list = await this.getCommunityCoordinatorList();
        return list.map((a) => a?.discordId).filter((a) => a);
    }
}

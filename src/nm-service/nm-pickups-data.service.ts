import { type ConfigModel, type DayNameType } from '../model';
import { GoogleSheetService } from '../service';

export interface PickUp {
    day: string;
    time: string;
    org: string;
    volunteer1: string;
    volunteer2: string;
    volunteer3: string;
    activity: string;
    comments: string;
    contact: string;
}

export class NmPickupsDataService {
    private readonly pickupsSheetService: GoogleSheetService<PickUp>;

    constructor(config: ConfigModel) {
        this.pickupsSheetService = new Sheet({
            sheetId: config.GSPREAD_CORE_PICKUPS_ID,
            range: 'pickups!A1:I'
        });
    }

    async getAllPickups(): Promise<PickUp[]> {
        return await this.pickupsSheetService.get();
    }

    async getPickupsFor(day: DayNameType): Promise<PickUp[]> {
        return await this.getAllPickups().then((pickups) =>
            pickups
                .filter((pickup) => pickup.day === day)
                .filter((pickup) => pickup.activity === 'food pickup')
        );
    }

    async updateCache() {
        await this.pickupsSheetService.updateCache();
    }
}

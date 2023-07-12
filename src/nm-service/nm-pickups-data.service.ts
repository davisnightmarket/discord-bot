import { type DayNameType, type NmInstanceConfigModel } from '../model';
import { GoogleSpreadsheetsService } from '../service';

const rowNames: Array<keyof PickUp> = [
    "day",
    "time",
    "org",
    "volunteer1",
    "volunteer2",
    "volunteer3",
    "activity",
    "comments",
    "contact",
]

interface PickUp {
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
    private readonly pickupsSheetService: GoogleSpreadsheetsService;

    constructor(config: NmInstanceConfigModel) {
        this.pickupsSheetService = new GoogleSpreadsheetsService(config.GSPREAD_CORE_PICKUPS_ID);
    }

    async getAllPickups() {
        return await this.pickupsSheetService
            .rangeGet("pickups!A2:I")
            .then((rows) => rows
                .filter(row => row.length > 0)
                .map(row => {
                    const pickup: Partial<PickUp> = {}
                    
                    for (let i = 0; i < row.length; i++) {
                        pickup[rowNames[i]] = row[i]
                    }

                    return pickup as PickUp
                })
            )
    }

    async getPickupsFor(day: DayNameType) {
        return await this.getAllPickups()
            .then((pickups) => pickups
                .filter((pickup) => pickup.day === day)
                .filter((pickup) => pickup.activity === "food pickup")
            )
    }
}

import { GoogleSheetService, type SpreadsheetDataModel } from '.';

interface FoodCountModel extends SpreadsheetDataModel {
    org: string;
    date: string;
    lbs: number;
    reporter: string;
    note: string;
}

// collumns for a food count sheet in case we need to create a new one
export const FOODCOUNT_HEADERS = ['date', 'org', 'lbs', 'reporter', 'note'];

export class NmFoodCountDataService {
    private readonly foodCountSheetMap = new Map<
        number,
        GoogleSheetService<FoodCountModel>
    >();

    spreadsheetId: string;

    constructor(spreadsheetId: string) {
        this.spreadsheetId = spreadsheetId;
    }

    createSheet(year: number) {
        // create the new sheet wraper
        const sheet = new GoogleSheetService<FoodCountModel>({
            spreadsheetId: this.spreadsheetId,
            sheetName: `food-count-${year}`,
            headersList: FOODCOUNT_HEADERS
        });

        // add it to the map
        this.foodCountSheetMap.set(year, sheet);

        // return
        return sheet;
    }

    getSheetByCurrentYear(
        year: number = new Date().getFullYear()
    ): GoogleSheetService<FoodCountModel> {
        return this.foodCountSheetMap.get(year) ?? this.createSheet(year);
    }

    async appendFoodCount(foodCount: FoodCountModel, year?: number) {
        await this.getSheetByCurrentYear(year).appendOneMap(foodCount);
    }
}

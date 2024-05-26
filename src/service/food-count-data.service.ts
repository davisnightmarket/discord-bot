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

export class FoodCountDataService {
    private readonly foodCountSheetMap = new Map<
        number,
        GoogleSheetService<FoodCountModel>
    >();

    spreadsheetId: string;

    constructor(spreadsheetId: string) {
        this.spreadsheetId = spreadsheetId;
    }

    async getFoodCountByDate(date: Date): Promise<FoodCountModel[]> {
        // todo: this will fail on January first but why?
        const year = date.getFullYear();
        const rows = await (
            await this.getSheetByYear(year)
        ).getAllRowsAsMaps({ limitRows: 500 });
        console.log(rows);
        return rows.filter((a) => {
            const d = new Date(a.date);
            return (
                d.getDate() + d.getMonth() + d.getFullYear() ===
                date.getDate() + date.getMonth() + date.getFullYear()
            );
        });
    }

    async createSheet(year: number) {
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

    async getSheetByYear(
        year: number = new Date().getFullYear()
    ): Promise<GoogleSheetService<FoodCountModel>> {
        return (
            this.foodCountSheetMap.get(year) ?? (await this.createSheet(year))
        );
    }

    async getSheetByCurrentYear(): Promise<GoogleSheetService<FoodCountModel>> {
        const year = new Date().getFullYear();
        return (
            this.foodCountSheetMap.get(year) ?? (await this.createSheet(year))
        );
    }

    async appendFoodCount(foodCount: FoodCountModel, year?: number) {
        await (await this.getSheetByYear(year)).appendOneMap(foodCount);
    }
}

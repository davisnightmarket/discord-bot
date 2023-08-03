import { Sheet } from '../service';

interface FoodCountModel {
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
        Sheet<FoodCountModel>
    >();
    private readonly foodCountSheetId: string;

    constructor(foodCountSheetId: string) {
        this.foodCountSheetId = foodCountSheetId;
    }

    private createSheet(year: number) {
        // create the new sheet wraper
        const sheet = new Sheet<FoodCountModel>({
            sheetId: this.foodCountSheetId,
            range: `'food-count ${year}'!A1:E`,
            defaultHeaders: FOODCOUNT_HEADERS
        });

        // add it to the map
        this.foodCountSheetMap.set(year, sheet);

        // return
        return sheet;
    }

    private for(
        year: number = new Date().getFullYear()
    ): Sheet<FoodCountModel> {
        return this.foodCountSheetMap.get(year) ?? this.createSheet(year);
    }

    async getFoodCount(year?: number) {
        return await this.for(year).get();
    }

    async appendFoodCount(foodCount: FoodCountModel[], year?: number) {
        await this.for(year).append(foodCount);
    }
}

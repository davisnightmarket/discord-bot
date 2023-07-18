import { Sheet } from '../service';

interface FoodCountModel {
    org: string;
    date: string;
    lbs: number;
    reporter: string;
    note: string;
}

export class NmFoodCountDataService {
    private readonly foodCountSheetService: Sheet<FoodCountModel>;

    constructor(foodCountSheetId: string) {
        this.foodCountSheetService = new Sheet({
            sheetId: foodCountSheetId,
            range: `'${getFoodCountSheetName()}'!A1:E`
        });
    }

    async getFoodCount() {
        return await this.foodCountSheetService.get();
    }

    async appendFoodCount(foodCount: FoodCountModel[]) {
        await this.foodCountSheetService.append(foodCount);
    }
}

function getFoodCountSheetName(year = new Date().getFullYear()): string {
    return `food-count ${year}`;
}
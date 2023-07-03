import { GoogleSpreadsheetsService } from '../service';

/**
 *  FOODCOUNT
 */

// the prefix for food-count sheets within spreadsheet - we make a new one every year
// sheet name will look like: "food-count 2023"
export const GSPREAD_FOODCOUNT_SHEET_PREFIX = 'food-count';

// corresond to collumns in food count sheet
export const GSPREAD_SHEET_FOODCOUNT_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];

type FoodCountList = [string, string, number, string, string];

interface FoodCountMapType {
    org: string;
    date: string;
    lbs: number;
    reporter: string;
    note: string;
}

export class NmFoodCountDataService {
    private readonly foodCountSheetService: GoogleSpreadsheetsService;

    getFoodCountSheetName(
        // defaults to current year
        year = new Date().getFullYear()
    ): string {
        return `${GSPREAD_FOODCOUNT_SHEET_PREFIX} ${year}`;
    }

    fromFoodCountMapToList({
        date,
        org,
        lbs,
        reporter,
        note
    }: FoodCountMapType): FoodCountList {
        return [date, org, lbs, reporter, note];
    }

    async getFoodCount(sheetName: string) {
        return (
            (await this.foodCountSheetService.rangeGet(
                `'${sheetName}'!A2:E`
            )) ?? []
        );
    }

    async appendFoodCount(
        foodCount: FoodCountMapType,
        // the current year's sheet name by default
        sheet = this.getFoodCountSheetName()
    ): Promise<[string, number]> {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (await this.foodCountSheetService.sheetCreateIfNone(sheet)) {
            await this.foodCountSheetService.rowsAppend(
                [GSPREAD_SHEET_FOODCOUNT_HEADERS],
                sheet
            );
        }
        // rowsAppend returns an array tuple of range string, and index inserted
        return [
            await this.foodCountSheetService.rowsAppend(
                [this.fromFoodCountMapToList(foodCount)],
                sheet
            ),
            // the length minus 1 is this the zero index of the inserted count
            (await this.foodCountSheetService.rangeGet(`'${sheet}'!A1:A`))
                .length - 1
        ];
    }

    async deleteFoodCountByIndex(
        startIndex: number,
        // todo: this is dangerous? we will delete the last row in tue current sheet by default
        sheetName: string = this.getFoodCountSheetName()
    ) {
        const sheetId = await this.foodCountSheetService.getSheetIdByName(
            sheetName
        );

        await this.foodCountSheetService.rowsDelete(
            startIndex,
            startIndex + 1,
            sheetId
        );
    }

    async deleteLastFoodCount(
        // todo: this is dangerous? we will delete the last row in tue current sheet by default
        sheetName: string = this.getFoodCountSheetName()
    ) {
        const range =
            (await this.foodCountSheetService.rangeGet(`'${sheetName}'!A:E`)) ??
            [];
        const lastRowIndex = range.length;
        if (lastRowIndex < 2) {
            console.error('We cannot delete the header');
            return;
        }
        await this.foodCountSheetService.rowsWrite(
            [['', '', '', '', '']],
            `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`
        );
    }

    constructor(foodCountSheetId: string) {
        this.foodCountSheetService = new GoogleSpreadsheetsService(
            foodCountSheetId
        );
    }
}

import { describe, expect, test, jest } from '@jest/globals';
import { ParseContentService } from '../src/service';
import {
    GSPREAD_SHEET_FOODCOUNT_HEADERS
} from '../src/nm-service';
import { foodCountInputService, foodCountDataService, foodSheetService } from './test-services'

jest.setTimeout(1000000);

describe('foodCountInputService', () => {
    test('getting a list of parsed data from a content', async () => {
        const [date, listOk, listFail] =
            await foodCountInputService.getFoodCountDateAndParsedInput(`
3/27
4 vb
1 DCM
4 fire
4 fw
2 odd fellws
6 dfc
student farm
`);

        expect(date).toBe('3/27/2023');
        expect(listOk.length).toBe(6);

        const [village, dcm, fire, fw, oddf, dfc] = listOk;
        expect(village.org).toBe('Village Bakery');
        expect(dcm.org).toBe('Davis Community Meals');
        expect(fire.org).toBe('Fire Wings');
        expect(fw.org).toBe('Fire Wings');
        expect(oddf.org).toBe("Odd Fellow's Hall");
        expect(dfc.org).toBe('Davis Food Co-op');

        expect(listFail.length).toBe(1);
    });

    test('getting the right date format', async () => {
        const a = ParseContentService.dateFormat(
            new Date('July 21, 1983 01:15:00')
        );

        expect(a).toBe('7/21/1983');
    });

    test('getting the most recent date from a day name', async () => {
        const a = foodCountInputService.getDateStringFromDay('monday');
        expect(new Date(a).getDay()).toBe(
            // a known monday
            new Date('February 27, 2023').getDay()
        );
    });

    test('getting the number and string from content', async () => {
        let a = foodCountInputService.getLbsAndString('8 lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('8 Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('8lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('Village Bakery  8lbs ');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString(
            'Village Bakery  8 pounds '
        );
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('Village Bakery');
        expect(a[0]).toBe(0);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('');
        expect(a[0]).toBe(0);
        expect(a[1]).toBe('');
    });
});

test('appends to the food count and deletes it', async () => {
    const sheetName = foodCountDataService.getFoodCountSheetName(1877);
    expect(sheetName).toBe('food-count 1877');

    await foodSheetService.sheetCreateIfNone(sheetName);
    await foodSheetService.rowsAppend(
        [GSPREAD_SHEET_FOODCOUNT_HEADERS],
        sheetName,
    );

    const foodCountBefore = await foodCountDataService.getFoodCount(sheetName);

    const foodRecordOne = {
        date: '01/19/1996',
        org: 'Sutter General',
        lbs: 8,
        note: 'baby food',
        reporter: 'christianco@gmail.com'
    };

    // appends to current year
    const a = await foodCountDataService.appendFoodCount(
        foodRecordOne,
        sheetName
    );

    expect(a[1]).toBeGreaterThan(0);

    const b = await foodSheetService.rangeGet(a[0]);

    const foodCountAfter = await foodCountDataService.getFoodCount(sheetName);

    expect(foodCountAfter.length).toBe(foodCountBefore.length + 1);

    expect(b[0][0]).toBe(foodRecordOne.date);
    expect(b[0][1]).toBe(foodRecordOne.org);
    expect(+b[0][2]).toBe(foodRecordOne.lbs);
    expect(b[0][3]).toBe(foodRecordOne.reporter);
    expect(b[0][4]).toBe(foodRecordOne.note);

    expect(foodCountAfter[foodCountAfter.length - 1][0]).toBe(foodRecordOne.date);
    expect(foodCountAfter[foodCountAfter.length - 1][1]).toBe(foodRecordOne.org);
    expect(+foodCountAfter[foodCountAfter.length - 1][2]).toBe(foodRecordOne.lbs);
    expect(foodCountAfter[foodCountAfter.length - 1][3]).toBe(foodRecordOne.reporter);
    expect(foodCountAfter[foodCountAfter.length - 1][4]).toBe(foodRecordOne.note);

    const foodRecordTwo = {
        date: '01/19/1999',
        org: 'Food Co-op',
        lbs: 1,
        note: 'fresh umbilical cord',
        reporter: 'christian@night-market.org'
    };

    await foodCountDataService.appendFoodCount(foodRecordTwo, sheetName);

    await foodCountDataService.deleteLastFoodCount(sheetName);

    const foodCountFinal = await foodCountDataService.getFoodCount(sheetName);
    expect(foodCountFinal[foodCountFinal.length - 1][0]).toBe(foodRecordOne.date);
    expect(foodCountFinal[foodCountFinal.length - 1][1]).toBe(foodRecordOne.org);
    expect(+foodCountFinal[foodCountFinal.length - 1][2]).toBe(foodRecordOne.lbs);
    expect(foodCountFinal[foodCountFinal.length - 1][3]).toBe(foodRecordOne.reporter);
    expect(foodCountFinal[foodCountFinal.length - 1][4]).toBe(foodRecordOne.note);

    await foodSheetService.sheetDestroy(sheetName);
});

import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';
import { ParseContentService } from '../../src/service';

jest.setTimeout(1000000);

describe('foodCountInputService', () => {
    test('getting a list of parsed data from a content', async () => {
        const { foodCountInputService } = await WaitForGuildServices;

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
        console.log([date, listOk, listFail]);
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
        const { foodCountInputService } = await WaitForGuildServices;
        const a = foodCountInputService.getDateStringFromDay('monday');
        expect(new Date(a).getDay()).toBe(
            // a known monday
            new Date('February 27, 2023').getDay()
        );
    });

    test('getting the number and string from content', async () => {
        const { foodCountInputService } = await WaitForGuildServices;
        let a = foodCountInputService.getLbsAndString('8 lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('8 Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = foodCountInputService.getLbsAndString('8lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');
    });
});

// test('appends to the food count', async () => {
//     const { foodCountDataService } = await WaitForGuildServices;
//     const foodCountBefore = await foodCountDataService.();

//     const foodRecordOne = {
//         date: '01/19/1996',
//         org: 'Sutter General',
//         lbs: Math.floor(Math.random() * 100),
//         note: 'baby food',
//         reporter: 'christianco@gmail.com'
//     };

//     await foodCountDataService.appendFoodCount(foodRecordOne);

//     const foodCountAfter = await foodCountDataService.getFoodCount();

//     expect(foodCountAfter.length).toBe(foodCountBefore.length + 1);

//     expect(foodCountAfter[foodCountAfter.length - 1].date).toBe(
//         foodRecordOne.date
//     );
//     expect(foodCountAfter[foodCountAfter.length - 1].org).toBe(
//         foodRecordOne.org
//     );
//     expect(+foodCountAfter[foodCountAfter.length - 1].lbs).toBe(
//         foodRecordOne.lbs
//     );
//     expect(foodCountAfter[foodCountAfter.length - 1].reporter).toBe(
//         foodRecordOne.reporter
//     );
//     expect(foodCountAfter[foodCountAfter.length - 1].note).toBe(
//         foodRecordOne.note
//     );
// });

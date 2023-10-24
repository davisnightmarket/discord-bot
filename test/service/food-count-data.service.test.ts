import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';
import { ParseContentService } from '../../src/service';

jest.setTimeout(1000000);

describe('foodCountDataService', () => {
    test('getting food count data ', async () => {
        const { foodCountDataService } = await WaitForGuildServices;
        console.log(new Date('2023-01-01'));
        foodCountDataService.getFoodCountByDate(new Date('2023-01-01'));
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

import { type ActiveStateType } from './model/night-market.model';

/**
 * CORE DATA
 */

// across our data model, these strings are used to identify if a resource is active or not
export const GSPREAD_CORE_ACTIVE_STATE_LIST: ActiveStateType[] = [
    'active',
    'inactive'
];

// // these are the names of the
// export const CONFIG_GSPREAD_SHEET_NAME: { [k in string]: keyof ConfigModel } = {
//     PERSON_SHEET: 'GSPREAD_CORE_ID',
//     ORG_SHEET: 'GSPREAD_CORE_ID',
//     FOOD_COUNT_SHEET: 'GSPREAD_FOODCOUNT_ID'
// };

export const DAYS_OF_WEEK = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
] as const;

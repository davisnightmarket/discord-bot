import { DAYS_OF_WEEK } from '../nm-const';

export const FoodCountReminder = () => {
    console.log('running a task at 9 am');
    const d = new Date();
    const day = DAYS_OF_WEEK[d.getDay()];
    console.log(day);
};

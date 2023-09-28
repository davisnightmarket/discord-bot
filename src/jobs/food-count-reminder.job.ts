import { DAYS_OF_WEEK } from '../nm-const';
import { NIGHT_CHANNEL_NAMES_MAP } from '../nm-service';

export const FoodCountReminder = () => {
    console.log('running a task at 9 am');
    // first we want to know what day it is
    const d = new Date();
    const today = DAYS_OF_WEEK[d.getDay()];
    const yesterday = DAYS_OF_WEEK[d.getDay() - 1] || DAYS_OF_WEEK[6];
    // did we do it right?
    console.log(today);
    console.log(yesterday);
    // next we want a list of all pickups this year so far (or at least a month back)
    // then we want to search back through them, and get only those that happened last night
    // if that number is zero, then we want to send a gentle reminder to the channel for that day

    // the name of the channel that maps to our day
    const channelName = Object.values(NIGHT_CHANNEL_NAMES_MAP).findIndex(
        (a) => a === yesterday
    );

    console.log(channelName);
};

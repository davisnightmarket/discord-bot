"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountReminder = void 0;
const nm_const_1 = require("../nm-const");
const nm_service_1 = require("../nm-service");
// Felix: do you want to do this?
// Awnser: no. A couple reasons:
// 1. I just don't think that food count is that important
// 2. I think other diffrent features are more important (mostly around scheduling / pickup)
// 3. If you want to get people into it, I think its better
//    to provide real motivation than just make it seem like a chore.
//    One idea for how to do this is provide tools that show how much
//    food we've gotten in cetrain periods of time of over all.
//    People find numbers going up very compelling. Something like that
//    Is definitly on my todo list since it both motivates people to do food count
//    as well get more food over all. And it dosent make NM seem more like a chore.
const FoodCountReminder = () => {
    console.log('running a task at 9 am');
    // first we want to know what day it is
    const d = new Date();
    const today = nm_const_1.DAYS_OF_WEEK[d.getDay()];
    const yesterday = nm_const_1.DAYS_OF_WEEK[d.getDay() - 1] || nm_const_1.DAYS_OF_WEEK[6];
    // did we do it right?
    console.log(today);
    console.log(yesterday);
    // next we want a list of all pickups this year so far (or at least a month back)
    // then we want to search back through them, and get only those that happened last night
    // if that number is zero, then we want to send a gentle reminder to the channel for that day
    // the name of the channel that maps to our day
    const channelName = Object.values(nm_service_1.NIGHT_CHANNEL_NAMES_MAP).findIndex((a) => a === yesterday);
    console.log(channelName);
};
exports.FoodCountReminder = FoodCountReminder;

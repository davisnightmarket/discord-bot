"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountReminderJob = void 0;
const service_1 = require("../service");
const utility_1 = require("../utility");
const FoodCountReminderJob = () => {
    console.log('running a task at 9 am');
    // first we want to know what day it is
    const d = new Date();
    const today = (0, utility_1.GetChannelDayToday)();
    const yesterday = (0, utility_1.GetChannelDayYesterday)();
    // did we do it right?
    console.log(today);
    console.log(yesterday);
    // next we want a list of all pickups this year so far (or at least a month back)
    // then we want to search back through them, and get only those that happened last night
    // if that number is zero, then we want to send a gentle reminder to the channel for that day
    // the name of the channel that maps to our day
    const channelName = Object.values(service_1.NIGHT_CHANNEL_NAMES_MAP).findIndex((a) => a === yesterday);
    console.log(channelName);
};
exports.FoodCountReminderJob = FoodCountReminderJob;

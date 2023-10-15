"use strict";
// provides command specific methods responding to events with data as needed
// intention is to further decouple discord specific responses, components, and logic from buisness logic
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessEventService = void 0;
const const_1 = require("../const");
const utility_1 = require("../utility");
// ProcessEventService is dedicated to knitting together data from events and services into
// a tuple of data for use in creating content and, optionally, components
// it is intended to unify data operations
class ProcessEventService {
    constructor(nightDataService) {
        this.nightDataService = nightDataService;
    }
    async getVolunteerListContent(day) {
        day = (day && const_1.DAYS_OF_WEEK_CODES.includes(day) ? day : (0, utility_1.GetChannelDayToday)());
        const { pickupList } = await this.nightDataService.getNightByDay(day);
        const roleDescription = '', hostList = '', roleName = '';
        return [
            {
                roleDescription,
                hostList,
                roleName
            },
            {
                day,
                pickupList
            }
        ];
    }
    // returns a list of volunteer commitments from night ops sheet
    // includes specific user
    async getUserVolunteerListContent(discordId, day) {
        day =
            day && const_1.DAYS_OF_WEEK_CODES.includes(day)
                ? day
                : (0, utility_1.GetChannelDayToday)();
        const { pickupList } = await this.nightDataService
            .getNightByDay(day)
            .then((a) => {
            a.pickupList.map((a) => a.personList.filter((b) => b.discordId === discordId));
            return a;
        });
        return [
            {
                day,
                pickupList
            }
        ];
    }
    userVolunteerEdit() {
        return {};
    }
}
exports.ProcessEventService = ProcessEventService;

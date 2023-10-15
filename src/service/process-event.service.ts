// provides command specific methods responding to events with data as needed
// intention is to further decouple discord specific responses, components, and logic from buisness logic

import { NightDataService, NightPickupModel } from '.';
import { DAYS_OF_WEEK_CODES } from '../const';
import { NmDayNameType } from '../model';
import { GetChannelDayToday } from '../utility';

// ProcessEventService is dedicated to knitting together data from events and services into
// a tuple of data for use in creating content and, optionally, components
// it is intended to unify data operations
export class ProcessEventService {
    nightDataService: NightDataService;
    constructor(nightDataService: NightDataService) {
        this.nightDataService = nightDataService;
    }

    async getVolunteerListContent(day?: NmDayNameType): Promise<
        [
            { roleDescription: string; hostList: string; roleName: string },
            {
                day: NmDayNameType;
                pickupList: NightPickupModel[];
            }
        ]
    > {
        day = (
            day && DAYS_OF_WEEK_CODES.includes(day) ? day : GetChannelDayToday()
        ) as NmDayNameType;

        const { pickupList } = await this.nightDataService.getNightByDay(day);
        const roleDescription = '',
            hostList = '',
            roleName = '';
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
    async getUserVolunteerListContent(
        discordId: string,
        day?: NmDayNameType
    ): Promise<
        [
            {
                day: NmDayNameType;
                pickupList: NightPickupModel[];
            }
        ]
    > {
        day =
            day && DAYS_OF_WEEK_CODES.includes(day)
                ? day
                : GetChannelDayToday();

        const { pickupList } = await this.nightDataService
            .getNightByDay(day)
            .then((a) => {
                a.pickupList.map((a) =>
                    a.personList.filter((b) => b.discordId === discordId)
                );
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

import { type Client } from 'discord.js';

import { GetChannelDayToday, GetGuildServices, GetDebug } from '../utility';
import {
    type CoreDataService,
    type NightOpsDataModel,
    type NightOpsTimelineDataModel
} from '../service';

// runs after market, at midnight
// adds rows to timeline for yesterday
// looks for tomorrow rows and adds them to state ops
// updates state of ops sheet for tomorrow
const dbg = GetDebug('NightTimelineJob');
export const NightTimelineJob = (client: Client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);

    for (const guild of guildList) {
        // get the channel by today name
        const channelDay = GetChannelDayToday();
        // get the guild service
        const { nightDataService, markdownService } = await GetGuildServices(
            guild.id
        );
        // get the current state of ops
        const nightOpsList = await nightDataService.getNightDataByDay(
            channelDay
        );

        dbg(`NIGHT OPS ${nightOpsList.length}`);

        // get first 1000 records of night timeline
        const nightTimelineList = await nightDataService.getNightTimelineList();

        // split past and future timeline records
        const date = new Date();
        const stamp =
            (date.getMonth() > 8
                ? (date.getMonth() + 1).toString()
                : '0' + (date.getMonth() + 1).toString()) +
            '/' +
            (date.getDate() > 9
                ? date.getDate().toString()
                : '0' + date.getDate().toString()) +
            '/' +
            date.getFullYear().toString();
        const timelineFuture = nightTimelineList.filter(
            (a) => new Date(a.stamp) > date
        );

        dbg('FUTURE', timelineFuture.length);
        const timelinePast = nightTimelineList.filter(
            // inclusive of today
            (a) => new Date(a.stamp) <= date
        );
        dbg('PAST', timelinePast.length);
        const quitterList: NightOpsDataModel[] = [];
        const newTimelineList: NightOpsTimelineDataModel[] = [];
        // adds quitters to the quitterList from the
        for (const {
            day,
            role,
            orgPickup,
            orgMarket,
            discordIdOrEmail,
            periodStatus,
            timeStart,
            timeEnd
        } of nightOpsList) {
            dbg(periodStatus, discordIdOrEmail);
            newTimelineList.push({
                day,
                role,
                orgPickup,
                orgMarket,
                discordIdOrEmail,
                periodStatus,
                timeStart,
                timeEnd,
                stamp
            });
            if (periodStatus === 'QUIT') {
                quitterList.push({
                    day,
                    role,
                    orgPickup,
                    orgMarket,
                    discordIdOrEmail,
                    periodStatus,
                    timeStart,
                    timeEnd
                });
            }
        }

        const existsFilter = timelinePast.map(
            ({
                day,
                role,
                orgPickup,
                orgMarket,
                discordIdOrEmail,
                periodStatus,
                timeStart,
                timeEnd,
                stamp
            }) =>
                [
                    day,
                    role,
                    orgPickup,
                    orgMarket,
                    discordIdOrEmail,
                    periodStatus,
                    timeStart,
                    timeEnd,
                    stamp
                ].join('')
        );
        nightDataService.addNightTimelineRecordList(
            newTimelineList.filter(
                ({
                    day,
                    role,
                    orgPickup,
                    orgMarket,
                    discordIdOrEmail,
                    periodStatus,
                    timeStart,
                    timeEnd,
                    stamp
                }) => {
                    return !existsFilter.includes(
                        [
                            day,
                            role,
                            orgPickup,
                            orgMarket,
                            discordIdOrEmail,
                            periodStatus,
                            timeStart,
                            timeEnd,
                            stamp
                        ].join('')
                    );
                }
            )
        );
        dbg(
            'Timeline',
            newTimelineList.filter(
                ({
                    day,
                    role,
                    orgPickup,
                    orgMarket,
                    discordIdOrEmail,
                    periodStatus,
                    timeStart,
                    timeEnd,
                    stamp
                }) =>
                    !existsFilter.includes(
                        [
                            day,
                            role,
                            orgPickup,
                            orgMarket,
                            discordIdOrEmail,
                            periodStatus,
                            timeStart,
                            timeEnd,
                            stamp
                        ].join('')
                    )
            )
        );

        // get timeline events happening today

        // for (const {
        //     day,
        //     role,
        //     org,
        //     discordIdOrEmail,
        //     periodStatus,
        //     timeStart,
        //     timeEnd
        // } of timelineFuture) {
        //     if (periodStatus === 'quit') {
        //         quitterList.push({
        //             day,
        //             role,
        //             org,
        //             discordIdOrEmail,
        //             periodStatus,
        //             timeStart,
        //             timeEnd
        //         });
        //     }
        // }

        dbg('QUITTER', quitterList.length);
        await nightDataService.removeNightData(quitterList);

        // todo: do we want an announce on timeline update? Probably not
        // const content = markdownService.getAfterMarketAnnounce(
        //     await GetGuildRoleIdByName(guild, channelDay),
        //     await nightDataService.getNightByDay(channelDay)
        // );

        // (
        //     (await guild.channels.cache.find(
        //         (channel) => channel.name === channelDay
        //     )) as TextChannel
        // )?.send({
        //     content
        // });
    }
};

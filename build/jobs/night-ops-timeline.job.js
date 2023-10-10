"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightTimelineJob = void 0;
const utility_1 = require("../utility");
// runs after market, at midnight
// adds rows to timeline for yesterday
// looks for tomorrow rows and adds them to state ops
// updates state of ops sheet for tomorrow
const dbg = (0, utility_1.Dbg)('NightTimelineJob');
const NightTimelineJob = (client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);
    for (const guild of guildList) {
        // get the channel by today name
        const channelDay = (0, utility_1.GetChannelDayToday)();
        // get the guild service
        const { nightDataService } = await (0, utility_1.GetGuildServices)(guild.id);
        // get the current state of ops
        const nightOpsList = await nightDataService.getNightDataByDay(channelDay);
        dbg(`NIGHT OPS ${nightOpsList.length}`);
        // get first 1000 records of night timeline
        const nightTimelineList = await nightDataService.getNightTimelineList();
        // split past and future timeline records
        const date = new Date();
        const stamp = (date.getMonth() > 8
            ? date.getMonth() + 1
            : '0' + (date.getMonth() + 1)) +
            '/' +
            (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
            '/' +
            date.getFullYear();
        const timelineFuture = nightTimelineList.filter((a) => new Date(a.stamp) > date);
        console.log('FUTURE', timelineFuture.length);
        const timelinePast = nightTimelineList.filter(
        // inclusive of today
        (a) => new Date(a.stamp) <= date);
        console.log('PAST', timelinePast.length);
        const quitterList = [];
        const newTimelineList = [];
        // adds quitters to the quitterList from the
        for (const { day, role, org, discordIdOrEmail, period, timeStart, timeEnd } of nightOpsList) {
            dbg(period, discordIdOrEmail);
            newTimelineList.push({
                day,
                role,
                org,
                discordIdOrEmail,
                period,
                timeStart,
                timeEnd,
                stamp
            });
            if (period === 'quit') {
                quitterList.push({
                    day,
                    role,
                    org,
                    discordIdOrEmail,
                    period,
                    timeStart,
                    timeEnd
                });
            }
        }
        const existsFilter = timelinePast.map(({ day, role, org, discordIdOrEmail, period, timeStart, timeEnd, stamp }) => [
            day,
            role,
            org,
            discordIdOrEmail,
            period,
            timeStart,
            timeEnd,
            stamp
        ].join(''));
        nightDataService.addNightTimelineRecordList(newTimelineList.filter(({ day, role, org, discordIdOrEmail, period, timeStart, timeEnd, stamp }) => {
            return !existsFilter.includes([
                day,
                role,
                org,
                discordIdOrEmail,
                period,
                timeStart,
                timeEnd,
                stamp
            ].join(''));
        }));
        console.log('Timeline', newTimelineList.filter(({ day, role, org, discordIdOrEmail, period, timeStart, timeEnd, stamp }) => {
            !existsFilter.includes([
                day,
                role,
                org,
                discordIdOrEmail,
                period,
                timeStart,
                timeEnd,
                stamp
            ].join(''));
        }));
        // get timeline events happening today
        // for (const {
        //     day,
        //     role,
        //     org,
        //     discordIdOrEmail,
        //     period,
        //     timeStart,
        //     timeEnd
        // } of timelineFuture) {
        //     if (period === 'quit') {
        //         quitterList.push({
        //             day,
        //             role,
        //             org,
        //             discordIdOrEmail,
        //             period,
        //             timeStart,
        //             timeEnd
        //         });
        //     }
        // }
        console.log('QUITTER', quitterList.length);
        await nightDataService.removeNightData(quitterList);
        const content = (0, utility_1.GetAfterMarketMessage)(await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay), await nightDataService.getNightByDay(channelDay));
        (await guild.channels.cache.find((channel) => channel.name === channelDay))?.send({
            content
        });
    }
};
exports.NightTimelineJob = NightTimelineJob;
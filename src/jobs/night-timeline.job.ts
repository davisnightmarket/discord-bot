import { type Client, type TextChannel } from 'discord.js';

import {
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetGuildServices,
    GetAnnounceMessage,
    GetAfterMarketMessage
} from '../utility';
import { NightOpsDataModel } from '../service';

// runs after market, updates state of ops sheet
// adds rows to timeline

export const NightTimelineJob = (client: Client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);

    for (const guild of guildList) {
        // get the channel by today name
        const channelDay = GetChannelDayToday();
        // get the guild service
        const { nightDataService } = await GetGuildServices(guild.id);
        // get the current state of ops
        const nightOpsList = await nightDataService.getNightDataByDay(
            channelDay
        );
        // get first 1000 records of night timeline
        const nightTimelineList = await nightDataService.getNightTimelineList();

        // split past and future timeline records
        const date = new Date();
        const stamp =
            (date.getMonth() > 8
                ? date.getMonth() + 1
                : '0' + (date.getMonth() + 1)) +
            '/' +
            (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
            '/' +
            date.getFullYear();
        const timelineFuture = nightTimelineList.filter(
            (a) => new Date(a.stamp) > date
        );

        const timelinePast = nightTimelineList.filter(
            (a) => new Date(a.stamp) <= date
        );

        const quitterList: NightOpsDataModel[] = [];

        for (const {
            day,
            role,
            org,
            discordIdOrEmail,
            period,
            timeStart,
            timeEnd
        } of nightOpsList) {
            await nightDataService.addNightTimelineRecord({
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

        for (const {
            day,
            role,
            org,
            discordIdOrEmail,
            period,
            timeStart,
            timeEnd
        } of timelineFuture) {
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

        await nightDataService.removeNightData(quitterList);

        const content = GetAfterMarketMessage(
            await GetGuildRoleIdByName(guild, channelDay),
            await nightDataService.getNightByDay(channelDay)
        );

        (
            (await guild.channels.cache.find(
                (channel) => channel.name === channelDay
            )) as TextChannel
        )?.send({
            content
        });
    }
};

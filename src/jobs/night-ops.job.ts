import { type Client, type TextChannel } from 'discord.js';

import {
    DebugUtility,
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetGuildServices
} from '../utility';

const dbg = DebugUtility('NightOpsJob');
// when a person requests a listing of
export const NightOpsJob = (client: Client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);

    for (const guild of guildList) {
        // get the guild service
        const { nightDataService, markdownService } = await GetGuildServices(
            guild.id
        );
        // get the channel by today name
        const channelDay = GetChannelDayToday();
        const nightMap = await nightDataService.getNightMapByDay(channelDay);
        dbg(channelDay);
        dbg(nightMap);

        const pickupList = [
            ...nightMap.marketList.map((a) => a.pickupList)
        ].flat();
        const hostList = [...nightMap.marketList.map((a) => a.hostList)].flat();
        let content: string = '';
        if (pickupList.length === 0 && hostList.length === 0) {
            dbg('No pickups or hosting scheduled.');
            content = 'No pickups or hosting scheduled.';
        } else {
            content = markdownService.getNightMapAnnounce(
                await GetGuildRoleIdByName(guild, channelDay),
                nightMap
            );
        }

        (
            guild.channels.cache.find(
                (channel) => channel.name === channelDay
            ) as TextChannel
        )?.send({
            content
        });
    }
};

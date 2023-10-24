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
        const nightMap = await nightDataService.getNightByDay(channelDay);
        if (nightMap.pickupList.length == 0 && nightMap.hostList.length == 0) {
            dbg('No pickups or hosting, skipping announce.');
        }
        const content = markdownService.getNightOpsAnnounce(
            await GetGuildRoleIdByName(guild, channelDay),
            nightMap
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

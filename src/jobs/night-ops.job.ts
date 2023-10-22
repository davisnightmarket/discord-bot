import { type Client, type TextChannel } from 'discord.js';

import {
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetGuildServices
} from '../utility';

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

        const content = markdownService.getNightOpsAnnounce(
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

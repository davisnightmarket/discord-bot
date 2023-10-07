import { type Client, type TextChannel } from 'discord.js';

import {
    GetAnnounceNightCapMessage,
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetGuildServices,
    GetOpsAnnounceMessage
} from '../utility';

// when a person requests a listing of
export const NightListEvent = (client: Client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);

    for (const guild of guildList) {
        // get the guild service
        const { nightDataService } = await GetGuildServices(guild.id);
        // get the channel by today name
        const channelDay = GetChannelDayToday();
        console.log(channelDay);
        // get night ops
        const { pickupsList, nightCapList } =
            await nightDataService.getNightByDay(channelDay);
        console.log(nightCapList.map((a) => a.personList));

        const roleId = await GetGuildRoleIdByName(guild, channelDay);
        // create message
        GetAnnounceNightCapMessage(roleId, nightCapList.pop());
        // TODO: this could be more elegant. Maybe better format for the ops lists
        const nightCap = nightCapList
            .map((a) => a.personList.map((b) => b.name).join(', '))
            .join(', ');
        const content =
            nightCap + '\n\n' + GetOpsAnnounceMessage(roleId, pickupsList);

        console.log(content);

        (
            (await guild.channels.cache.find(
                (channel) => channel.name === channelDay
            )) as TextChannel
        )?.send({
            content
        });
    }
};

import { type Guild } from 'discord.js';

import {
    GetChannelByName,
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetOpsAnnounceMessage
} from '../utility';
import { type GuildServiceModel } from '../model';

// sends a list of operations to a guild channel with the same day name as today
export async function OpsListJob(
    { nightDataService }: GuildServiceModel,
    guild: Guild
) {
    const day = GetChannelDayToday();

    const { pickupsList } = await nightDataService.getNightByDay(day);

    const content = GetOpsAnnounceMessage(
        await GetGuildRoleIdByName(guild, day),
        pickupsList
    );

    const channel = GetChannelByName(day, guild);

    channel?.send(content);
}

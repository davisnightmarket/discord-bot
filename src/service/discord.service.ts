import { ChannelType, type Guild, type TextChannel } from 'discord.js';

export function getChannelByName(guild: Guild | null, name: string) {
    return guild?.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && c.name === name.toLowerCase()
    ) as TextChannel;
}

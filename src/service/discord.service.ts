import {
    ChannelType,
    type GuildTextBasedChannel,
    type Message,
    type Interaction
} from 'discord.js';

type HasGuild = Message | Interaction;

export function getChannelByName(client: HasGuild, name: string) {
    return client.guild?.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && c.name === name.toLowerCase()
    ) as GuildTextBasedChannel;
}

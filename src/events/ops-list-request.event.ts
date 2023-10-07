import {
    roleMention,
    type Guild,
    bold,
    userMention,
    type ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    type Interaction
} from 'discord.js';

import {
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetPickupsMessage
} from '../utility';
import { type NmDayNameType, type GuildServiceModel } from '../model';
import { DAYS_OF_WEEK } from '../nm-const';

// when a person requests a listing of
export async function OpsListRequest(
    { nightDataService }: GuildServiceModel,
    guild: Guild,
    interaction: ChatInputCommandInteraction
) {
    let channelDay = (
        await guild?.channels?.fetch(interaction?.channelId ?? '')
    )?.name as NmDayNameType;
    channelDay = DAYS_OF_WEEK.includes(channelDay)
        ? channelDay
        : GetChannelDayToday();

    const { pickupList } = await nightDataService.getNightByDay(channelDay);

    const roleId = await GetGuildRoleIdByName(guild, channelDay);
    for (const o of pickupList) {
        // todo: create message per pickup
        const content = 'GetOpsJoinMessage(roleId, o)';
        const joinOnceButton = new ButtonBuilder()
            .setCustomId(`pickups-once--${channelDay}`)
            .setLabel('Join Once')
            .setStyle(ButtonStyle.Secondary);
        const joinAlwaysButton = new ButtonBuilder()
            .setCustomId(`pickups-always--${channelDay}`)
            .setLabel('Join Once')
            .setStyle(ButtonStyle.Secondary);
        // // t
        interaction.reply({
            content,
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(joinOnceButton)
                    .addComponents(joinAlwaysButton)
            ],
            // if this is an interaction then it's come from
            // a slash command, so in that case we only want the
            // person who issued the command to see it
            // since we can have one or more cron based announcement for everyone else
            // this will prevent people spamming everyone every time
            // they want to see what the pickups are
            ephemeral: true
        });
    }
}

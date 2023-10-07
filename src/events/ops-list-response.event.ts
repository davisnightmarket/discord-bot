import {
    type Guild,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction
} from 'discord.js';

import {
    GetChannelDayToday,
    GetGuildRoleIdByName,
    GetPickupsMessage
} from '../utility';
import { type NmDayNameType, type GuildServiceModel } from '../model';
import { DAYS_OF_WEEK } from '../nm-const';

// receives a response to a list request for ops:
// allows someone to sign up for pickup or host
export async function OpsListResponseEvent(
    { nightDataService }: GuildServiceModel,
    interaction: CommandInteraction,
    day?: NmDayNameType
) {
    let channelDay = day ?? (interaction?.guild?.name as NmDayNameType);
    channelDay = DAYS_OF_WEEK.includes(channelDay)
        ? channelDay
        : GetChannelDayToday();

    const content = GetPickupsMessage(
        await nightDataService.getNightByDay(channelDay)
    );

    // todo: not sure we need a button. I think it's more likely folks will simply hit the / command again
    // rather than scroll up and hit a button, especially if there's been a lot of conversation since.
    const joinOnceButton = new ButtonBuilder()
        .setCustomId(`pickups-once--${channelDay}`)
        .setLabel('Join Once')
        .setStyle(ButtonStyle.Secondary);
    const joinAlwaysButton = new ButtonBuilder()
        .setCustomId(`pickups-always--${channelDay}`)
        .setLabel('Join Once')
        .setStyle(ButtonStyle.Secondary);
    // // todo: only add a quit button if they are signed up
    // const quitButton = new ButtonBuilder()
    //     .setCustomId(`pickups-leave--${channelDay}`)
    //     .setLabel('Quit')
    //     .setStyle(ButtonStyle.Secondary);

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

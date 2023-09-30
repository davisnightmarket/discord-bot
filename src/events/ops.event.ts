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
    GetChannelByName,
    GetChannelDayToday,
    GetGuildRoleIdByName
} from '../utility';
import { type GuildServiceModel } from '../model';
import { OpsWithPersonListModel } from '../service';

// when a person opts in to do a pickup or role per night
export const PickupJoinEvent = async (
    { opsDataService }: GuildServiceModel,
    interaction: Interaction
) => {
    // Is this our interaction to deal with?
    interaction = interaction as ButtonInteraction;
    const { customId } = interaction;
    if (!customId) return;
    const [name, day] = customId.split('--');
    if (name !== 'pickups-refresh') return;

    const guild = interaction.guild;
    if (!guild) return;

    // regenerate the message

    const channelDay = GetChannelDayToday();
    const pickupsList = await opsDataService.getOpsWithPersonListByDay(
        channelDay
    );

    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsList
    );

    // update it
    interaction.message.edit(content);
};

// when a person requests a listing of
export async function PickupsListEvent(
    { opsDataService, personCoreService }: GuildServiceModel,
    guild: Guild,
    interaction?: ChatInputCommandInteraction
) {
    // if (!pickupsCache) {
    //     pickupsCacheRefresh({ opsDataService, personCoreService });
    // }

    const channelDay = GetChannelDayToday();
    const pickupsList = await opsDataService.getOpsWithPersonListByDay(
        channelDay
    );

    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsList
    );
    if (interaction) {
        // todo: not sure we need a button. I think it's more likely folks will simply hit the / command again
        // rather than scroll up and hit a button, especially if there's been a lot of conversation since.
        const refreshButton = new ButtonBuilder()
            .setCustomId(`pickups-refresh--${channelDay}`)
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            refreshButton
        );

        interaction.reply({
            content,
            components: [row],
            // if this is an interaction then it's come from
            // a slash command, so in that case we only want the
            // person who issued the command to see it
            // since we can have one or more cron based announcement for everyone else
            // this will prevent people spamming everyone every time
            // they want to see what the pickups are
            ephemeral: true
        });
    } else {
        const channel = GetChannelByName(channelDay);
        channel.send(content);
    }
}

// todo: move this to the message service
function createPickupsMessage(
    roleId: string,
    ops: OpsWithPersonListModel[]
): string {
    let message = `## ${roleMention(roleId)} pickups!\n\n`;
    ops.filter((op) => op.role === 'night-pickup').forEach((op) => {
        message += `${bold(op.org)} at ${op.time}\n`;
        op.personList
            .filter((a) => a)
            .forEach((person) => {
                message += `> ${bold(person.name)} ${
                    person.discordId ? userMention(person.discordId) : ''
                }\n`;
            });
    });
    return message;
}

// todo: does it make sense to create a thread when there's a dedicated channel?
// async function createTodaysPickupThread(guild: Guild) {
//     const channel = GetChannelByName(guild, GetChannelDayToday());
//     const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
//     return await channel.threads.create({ name });
// }

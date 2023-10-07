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
import { type NmDayNameType, type GuildServiceModel } from '../model';
import { type OpsModel } from '../service';
import { DAYS_OF_WEEK } from '../nm-const';

// when a person opts in to do a pickup or role per night
export const PickupJoinEvent = async (
    { nightDataService }: GuildServiceModel,
    interaction: Interaction
) => {
    // Is this our interaction to deal with?
    interaction = interaction as ButtonInteraction;
    const { customId } = interaction;
    if (!customId) return;
    const [name, day, time] = customId.split('--');
    if (name !== 'pickups-refresh') return;

    const guild = interaction.guild;
    if (!guild) return;

    // regenerate the message

    const channelDay = GetChannelDayToday();
    const { pickupsList } = await nightDataService.getNightByDay(channelDay);

    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsList
    );

    // update it
    interaction.message.edit(content);

    // TODO: update pickups list with new data

    // nightDataService.updateOpsData({
    //     day:(day as NmDayNameType),
    //     time
    // });
};

export async function PickupsListEvent(
    { nightDataService }: GuildServiceModel,
    guild: Guild,
    interaction?: ChatInputCommandInteraction
) {
    let channelDay = (
        await guild?.channels?.fetch(interaction?.channelId ?? '')
    )?.name as NmDayNameType;
    channelDay = DAYS_OF_WEEK.includes(channelDay)
        ? channelDay
        : GetChannelDayToday();

    const { pickupsList } = await nightDataService.getNightByDay(channelDay);
    console.log(pickupsList);
    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsList
    );

    if (interaction) {
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
    } else {
        const channel = GetChannelByName(channelDay);
        channel.send(content);
    }
}

// when a person requests a listing of
export async function PickupsListRequest(
    { nightDataService }: GuildServiceModel,
    guild: Guild,
    interaction?: ChatInputCommandInteraction
) {
    let channelDay = (
        await guild?.channels?.fetch(interaction?.channelId ?? '')
    )?.name as NmDayNameType;
    channelDay = DAYS_OF_WEEK.includes(channelDay)
        ? channelDay
        : GetChannelDayToday();

    const { pickupsList } = await nightDataService.getNightByDay(channelDay);
    console.log(pickupsList);
    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsList
    );

    if (interaction) {
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
    } else {
        const channel = GetChannelByName(channelDay);
        channel.send(content);
    }
}

// todo: move this to the message service
function createPickupsMessage(roleId: string, ops: OpsModel[]): string {
    return ops.reduce((message, o) => {
        return `${o.personList
            .map((person) => {
                return `${bold(person.name)} ${
                    person.discordId ? userMention(person.discordId) : ''
                }`;
            })
            .join(', ')}${bold(o.org)} at ${o.timeStart}\n`;
    }, `## ${roleMention(roleId)} pickups!\n`);
}

// todo: does it make sense to create a thread when there's a dedicated channel?
// async function createTodaysPickupThread(guild: Guild) {
//     const channel = GetChannelByName(guild, GetChannelDayToday());
//     const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
//     return await channel.threads.create({ name });
// }

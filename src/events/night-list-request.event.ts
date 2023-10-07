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
    Interaction,
    CommandInteraction,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    AnySelectMenuInteraction,
    StringSelectMenuInteraction
} from 'discord.js';

import { GetChannelDayToday, GetPickupJoinMessage } from '../utility';
import {
    type NmDayNameType,
    type GuildServiceModel,
    NmNightRoleType,
    NmRolePeriodType
} from '../model';
import { DAYS_OF_WEEK, NM_NIGHT_ROLES } from '../const';

// when a person requests a listing of
export async function NightListRequestEvent(
    { nightDataService }: GuildServiceModel,

    interaction: Interaction
) {
    if (!interaction.guild) {
        (interaction as ChatInputCommandInteraction).reply(
            'Hi, you can only do that on the server!'
        );
        return;
    }

    const guild = interaction.guild as Guild;

    await (interaction as ChatInputCommandInteraction).deferReply();

    if (interaction.isCommand()) {
        interaction = interaction as ChatInputCommandInteraction;
        let channelDay = (
            await guild?.channels?.fetch(interaction?.channelId ?? '')
        )?.name as NmDayNameType;
        channelDay = DAYS_OF_WEEK.includes(channelDay)
            ? channelDay
            : GetChannelDayToday();

        const { pickupList } = await nightDataService.getNightByDay(channelDay);

        const components: ActionRowBuilder<ButtonBuilder>[] = [];
        const content = GetPickupJoinMessage(pickupList);

        const joinOnceButton = new ButtonBuilder()
            .setCustomId(`volunteer--${channelDay}--night-host`)
            .setLabel(NM_NIGHT_ROLES['night-host'].description)
            .setStyle(ButtonStyle.Secondary);
        const joinAlwaysButton = new ButtonBuilder()
            .setCustomId(`volunteer--${channelDay}--night-pickup`)
            .setLabel(NM_NIGHT_ROLES['night-pickup'].description)
            .setStyle(ButtonStyle.Secondary);

        components.push(
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(joinOnceButton)
                .addComponents(joinAlwaysButton)
        );
        interaction.editReply({
            content,
            components
        });
        return;
    }

    const [command, day, role, period] = (
        interaction as ButtonInteraction
    )?.customId.split('--') as [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ];
    console.log(command, day, role, period);
    if (command !== 'volunteer') {
        return;
    }

    if (interaction.isStringSelectMenu()) {
        // TODO: save to DB
        const [org, timeStart, timeEnd] = interaction.values[0].split('---');
        await nightDataService.updateNightData({
            day,
            org, // this should be Davis Night Market in Central Park
            role,
            discordIdOrEmail: interaction.user.id,
            period,

            timeStart,
            // both of these should be got from core data
            timeEnd: ''
        });
        interaction.editReply({
            content: interaction.values[0]
        });
    }

    // todo: replace all this with createMessageComponentCollector
    if (interaction.isButton()) {
        // some other button command

        // there should always be a day
        if (!day || !DAYS_OF_WEEK.includes(day as NmDayNameType)) {
            interaction.editReply({
                content:
                    'Sorry, something went wrong. We have notified the people!'
            });
            console.error('Passed not a day');
            return;
        }
        const { pickupList, hostList } = await nightDataService.getNightByDay(
            day
        );
        // role is selected in the first interaction
        if (!role) {
            interaction.editReply({
                content:
                    'Sorry, something went wrong. We have notified the people!'
            });
            console.error('Passed not a role.');
            return;
        }

        const roleDescription = NM_NIGHT_ROLES[role].description;
        if (!period) {
            const joinOnceButton = new ButtonBuilder()
                .setCustomId(`volunteer--${day}--${role}--once`)
                .setLabel(`${role} just this ${day}`)
                .setStyle(ButtonStyle.Secondary);
            const joinAlwaysButton = new ButtonBuilder()
                .setCustomId(`volunteer--${day}--${role}--every`)
                .setLabel(`${role}  every ${day}`)
                .setStyle(ButtonStyle.Secondary);

            interaction.editReply({
                content: `${roleDescription} with ${hostList
                    .map((a) => a.name)
                    .join(', ')}\nWould you like to ${
                    NM_NIGHT_ROLES[role].description
                } just once, or commit to a night?\n(you can decide to commit later)`,
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(joinOnceButton)
                        .addComponents(joinAlwaysButton)
                ]
            });

            return;
        }

        // the successful select is handled above by isStringSelectMenu
        if (role === 'night-pickup') {
            console.log('NIGHT PICKUP', pickupList);
            // TODO: we can only select 25 at a time, so slice em up
            const select = new StringSelectMenuBuilder()
                .setCustomId(`volunteer--${day}--${role}--${period}--org`)
                .setPlaceholder('Make a selection!')
                .addOptions(
                    pickupList.map(({ org, timeStart, timeEnd, personList }) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(org)
                            .setDescription(
                                `at ${timeStart}${
                                    personList.length ? ' with ' : ''
                                }${personList.map((a) => a.name).join(', ')}`
                            )
                            .setValue(`${org}---${timeStart}---${timeEnd}`)
                    )
                );

            interaction.editReply({
                content: 'OK, all set!',
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        select
                    )
                ]
            });

            return;
        }

        if (role === 'night-host') {
            // TODO: save to DB
            await nightDataService.updateNightData({
                day,
                org: '', // this should be Davis Night Market in Central Park
                role,
                discordIdOrEmail: interaction.user.id,
                period,
                // both of these should be got from core data
                timeStart: '2100',
                timeEnd: ''
            });
            // succcess!
            interaction.editReply({
                content: 'OK, all set!'
            });

            return;
        }

        return;
    }
}

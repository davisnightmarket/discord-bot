import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    Interaction,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder
} from 'discord.js';

import {
    type NmDayNameType,
    type GuildServiceModel,
    NmNightRoleType,
    NmRolePeriodType
} from '../model';
import { DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';

// todo: split this into different events for clarity
// when a person requests a listing of
export async function VolunteerResponseEvent(
    { nightDataService, messageService }: GuildServiceModel,

    interaction: Interaction
) {
    (interaction as ButtonInteraction).deferReply();

    console.log('HI');
    const [command, day, role, period] =
        ((interaction as ButtonInteraction)?.customId?.split('--') as [
            string,
            NmDayNameType,
            NmNightRoleType,
            NmRolePeriodType
        ]) || [];
    if (command !== 'volunteer') {
        return;
    }
    console.log(command, day, role, period);
    if (interaction.isStringSelectMenu()) {
        // TODO: save to DB
        const [org, timeStart] = interaction.values[0].split('---');
        await nightDataService.addNightData([
            {
                day,
                org, // this should be Davis Night Market in Central Park
                role,
                discordIdOrEmail: interaction.user.id,
                period,

                timeStart,
                // both of these should be got from core data
                timeEnd: ''
            }
        ]);
        interaction.editReply({
            content: interaction.values[0]
        });
    }

    // todo: replace all this with createMessageComponentCollector
    if (interaction.isButton()) {
        interaction = interaction as ButtonInteraction;
        // there should always be a day
        if (!day || !DAYS_OF_WEEK_CODES.includes(day as NmDayNameType)) {
            interaction.editReply({
                content: await messageService.getGenericSorry()
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
                content: await messageService.getGenericSorry()
            });
            console.error('Passed not a role.');
            return;
        }

        const roleDescription = NM_NIGHT_ROLES[role].description;
        if (!period) {
            const joinOnceButton = new ButtonBuilder()
                .setCustomId(`volunteer--${day}--${role}--once`)
                .setLabel(`${NM_NIGHT_ROLES[role].name} just this ${day}`)
                .setStyle(ButtonStyle.Secondary);
            const joinAlwaysButton = new ButtonBuilder()
                .setCustomId(`volunteer--${day}--${role}--every`)
                .setLabel(`${NM_NIGHT_ROLES[role].name}  every ${day}`)
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
                            .setValue(
                                `${org}---${timeStart}---${timeEnd || '0000'}`
                            )
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
            await nightDataService.addNightData([
                {
                    day,
                    org: '', // this should be Davis Night Market in Central Park
                    role,
                    discordIdOrEmail: interaction.user.id,
                    period,
                    // both of these should be got from core data
                    timeStart: '2100',
                    timeEnd: ''
                }
            ]);
            // succcess!
            interaction.editReply({
                content: 'OK, all set!'
            });

            return;
        }

        return;
    }
}

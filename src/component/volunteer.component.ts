import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import { NightPersonModel, NightPickupModel } from '../service';
import { NM_NIGHT_ROLES } from '../const';

export function GetVolunteerPeriodComponent({
    day,
    role
}: Pick<NightPersonModel, 'day' | 'role'>) {
    const joinOnceButton = new ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--once`)
        .setLabel(`${NM_NIGHT_ROLES[role].name} just this ${day}`)
        .setStyle(ButtonStyle.Secondary);
    const joinAlwaysButton = new ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--every`)
        .setLabel(`${NM_NIGHT_ROLES[role].name}  every ${day}`)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton)
    ];
}

export function GetVolunteerPickupComponent(
    {
        day,
        role,
        period
    }: Required<Pick<NightPersonModel, 'day' | 'role' | 'period'>>,
    pickupList: NightPickupModel[]
) {
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
                    .setValue(`${org}---${timeStart}---${timeEnd || '0000'}`)
            )
        );

    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
    ];
}

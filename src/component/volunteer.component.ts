import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import { NightPersonModel, NightPickupModel } from '../service';
import { NM_NIGHT_ROLES } from '../const';

export function GetVolunteerEditComponent({
    discordId,
    day
}: Pick<NightPersonModel, 'discordId' | 'day'>) {
    const editButton = new ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--${discordId}`)
        .setLabel(`Edit Volunteer Commitment`)
        .setStyle(ButtonStyle.Secondary);

    return [new ActionRowBuilder<ButtonBuilder>().addComponents(editButton)];
}

export function GetVolunteerRoleComponent({
    day,
    discordId
}: Pick<NightPersonModel, 'day' | 'discordId'>) {
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    const hostButton = new ButtonBuilder()
        .setCustomId(`volunteer-role--${day}--night-host--${discordId}`)
        .setLabel(NM_NIGHT_ROLES['night-host'].description)
        .setStyle(ButtonStyle.Secondary);
    const pickupButton = new ButtonBuilder()
        .setCustomId(`volunteer-role--${day}--night-pickup--${discordId}`)
        .setLabel(NM_NIGHT_ROLES['night-pickup'].description)
        .setStyle(ButtonStyle.Secondary);

    components.push(
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(hostButton)
            .addComponents(pickupButton)
    );

    return components;
}

export function GetVolunteerPeriodComponent({
    day,
    role,
    discordId
}: Pick<NightPersonModel, 'day' | 'role' | 'discordId'>) {
    const joinOnceButton = new ButtonBuilder()
        .setCustomId(`volunteer-period--${day}--${role}--once--${discordId}`)
        .setLabel(`${NM_NIGHT_ROLES[role].name} just this ${day}`)
        .setStyle(ButtonStyle.Secondary);
    const joinAlwaysButton = new ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--every--${discordId}`)
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
        period,
        discordId
    }: Required<
        Pick<NightPersonModel, 'day' | 'role' | 'period' | 'discordId'>
    >,
    pickupList: NightPickupModel[]
) {
    const select = new StringSelectMenuBuilder()
        .setCustomId(
            `volunteer-pickup--${day}--${role}--${period}--org--${discordId}`
        )
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

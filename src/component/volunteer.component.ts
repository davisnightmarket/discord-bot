import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import { NightPersonModel, NightPickupModel } from '../service';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';

export function GetVolunteerInitComponent({
    discordId,
    day
}: Pick<NightPersonModel, 'discordId' | 'day'>) {
    const editButton = new ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--${discordId}`)
        .setLabel(`Edit Volunteer Commitments`)
        .setStyle(ButtonStyle.Secondary);

    const viewButton = new ButtonBuilder()
        .setCustomId(`volunteer-view--${discordId}`)
        .setLabel(`View All Commitments`)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(editButton)
            .addComponents(viewButton)
    ];
}

export function GetVolunteerListAllComponent({
    discordId,
    day
}: Pick<NightPersonModel, 'discordId' | 'day'>) {
    const editDayButton = new StringSelectMenuBuilder()
        .setCustomId(`volunteer-edit-day--${discordId}`)

        .setPlaceholder('')
        .addOptions(
            DAYS_OF_WEEK_CODES.map((d) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(DAYS_OF_WEEK[d].name)
                    .setDefault(day === d)
                    .setDescription(``)
                    .setValue(d)
            )
        );

    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            editDayButton
        )
    ];
}

export function GetVolunteerRoleComponent({
    day,
    discordId
}: Pick<NightPersonModel, 'day' | 'discordId'>) {
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    const hostButton = new ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-host--${discordId}`)
        .setLabel(NM_NIGHT_ROLES['night-host'].description)
        .setStyle(ButtonStyle.Secondary);
    const pickupButton = new ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-pickup--${discordId}`)
        .setLabel(NM_NIGHT_ROLES['night-pickup'].description)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(hostButton)
            .addComponents(pickupButton)
    ];
}

export function GetVolunteerRoleShadowComponent({
    day,
    discordId
}: Pick<NightPersonModel, 'day' | 'discordId'>) {
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    const shadowHostButton = new ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-host-shadow--${discordId}`)
        .setLabel(NM_NIGHT_ROLES['night-host-shadow'].description)
        .setStyle(ButtonStyle.Secondary);
    const shadowPickupButton = new ButtonBuilder()
        .setCustomId(
            `volunteer-init--${day}--night-pickup-shaddow--${discordId}`
        )
        .setLabel(NM_NIGHT_ROLES['night-pickup-shadow'].description)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(shadowHostButton)
            .addComponents(shadowPickupButton)
    ];
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
        discordId
    }: Required<Pick<NightPersonModel, 'day' | 'role' | 'discordId'>>,
    pickupList: NightPickupModel[]
) {
    const select = new StringSelectMenuBuilder()
        .setCustomId(
            `volunteer-pickup-org---${day}--${role}--org--${discordId}`
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

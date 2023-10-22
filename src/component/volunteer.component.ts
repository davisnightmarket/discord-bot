import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import {
    NightPersonModel,
    NightPickupModel,
    ParseContentService
} from '../service';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';

export function GetVolunteerInitComponent({
    discordId,
    day
}: Pick<NightPersonModel, 'discordId' | 'day'>) {
    const pickupButton = new ButtonBuilder()
        .setCustomId(`volunteer-pickup--${day}--${discordId}`)
        .setLabel(`Volunteer the Pickup Button`)
        .setStyle(ButtonStyle.Secondary);

    const hostButton = new ButtonBuilder()
        // this is an "update" since we don't need more data, we can save this to db
        .setCustomId(`volunteer-distro-update--${day}--${discordId}`)
        .setLabel(`Volunteer the Distro Button`)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            pickupButton,
            hostButton
        )
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
        .setCustomId(`volunteer-init--${day}--night-distro--${discordId}`)
        .setLabel(NM_NIGHT_ROLES['night-distro'].description)
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
        .setCustomId(
            `volunteer-init--${day}--night-distro-shadow--${discordId}`
        )
        .setLabel(NM_NIGHT_ROLES['night-distro-shadow'].description)
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
    { day, discordId }: Required<Pick<NightPersonModel, 'day' | 'discordId'>>,
    pickupList: NightPickupModel[]
) {
    const hasOwnPickups = pickupList.filter((a) =>
        a.personList.some((b) => b.discordIdOrEmail === discordId)
    ).length;

    const rows: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`volunteer-pickup-update--${day}--${discordId}`)
                .setPlaceholder('Make a selection!')
                .setMinValues(1)
                .setMaxValues(pickupList.length)
                .addOptions(
                    pickupList.map(({ org, timeStart, timeEnd, personList }) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`Pickup: ${org}`)
                            .setDescription(
                                `at ${ParseContentService.getAmPmTimeFrom24Hour(
                                    timeStart
                                )}${
                                    personList.length ? ' with ' : ''
                                }${personList.map((a) => a.name).join(', ')}`
                            )
                            .setValue(
                                `${org}---${timeStart}---${timeEnd || '0000'}`
                            )
                    )
                )
        )
    ];

    if (hasOwnPickups) {
        rows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `volunteer-pickup-delete--${day}--${discordId}`
                    )
                    .setLabel(`Delete ${hasOwnPickups} Pickups`)
                    .setStyle(ButtonStyle.Secondary)
            )
        );
    }
    return rows;
}

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import {
    type NightPersonModel,
    type NightPickupModel,
    ParseContentService,
    type NightMarketModel
} from '../service';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';

export function GetVolunteerInitComponent({
    discordId,
    day
}: Pick<NightPersonModel, 'discordId' | 'day'>) {
    const pickupButton = new ButtonBuilder()
        .setCustomId(`volunteer-pickup--${day as string}--${discordId}`)
        .setLabel(`Volunteer the Pickup Button`)
        .setStyle(ButtonStyle.Secondary);

    const hostButton = new ButtonBuilder()
        // this is an "update" since we don't need more data, we can save this to db
        .setCustomId(`volunteer-distro--${day as string}--${discordId}`)
        .setLabel(`Volunteer the Distro Button`)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            pickupButton,
            hostButton
        )
    ];
}

export function GetVolunteerRoleComponent({
    discordId,
    day
}: Pick<NightPersonModel, 'discordId' | 'day'>) {
    const pickupButton = new ButtonBuilder()
        .setCustomId(`volunteer-pickup--${day as string}--${discordId}`)
        .setLabel(`Volunteer the Pickup Button`)
        .setStyle(ButtonStyle.Secondary);

    const hostButton = new ButtonBuilder()
        // this is an "update" since we don't need more data, we can save this to db
        .setCustomId(`volunteer-distro--${day as string}--${discordId}`)
        .setLabel(`Volunteer the Distro Button`)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            pickupButton,
            hostButton
        )
    ];
}
export function GetVolunteerListDayComponent({
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

// export function GetVolunteerRoleComponent({
//     day,
//     discordId
// }: Pick<NightPersonModel, 'day' | 'discordId'>) {
//     const components: Array<ActionRowBuilder<ButtonBuilder>> = [];

//     const hostButton = new ButtonBuilder()
//         .setCustomId(
//             `volunteer-init--${day as string}--night-distro--${discordId}`
//         )
//         .setLabel(NM_NIGHT_ROLES['night-distro'].description)
//         .setStyle(ButtonStyle.Secondary);
//     const pickupButton = new ButtonBuilder()
//         .setCustomId(
//             `volunteer-init--${day as string}--night-pickup--${discordId}`
//         )
//         .setLabel(NM_NIGHT_ROLES['night-pickup'].description)
//         .setStyle(ButtonStyle.Secondary);

//     return [
//         new ActionRowBuilder<ButtonBuilder>()
//             .addComponents(hostButton)
//             .addComponents(pickupButton)
//     ];
// }

export function GetVolunteerRoleShadowComponent({
    day,
    discordId
}: Pick<NightPersonModel, 'day' | 'discordId'>) {
    const components: Array<ActionRowBuilder<ButtonBuilder>> = [];

    const shadowHostButton = new ButtonBuilder()
        .setCustomId(
            `volunteer-init--${
                day as string
            }--night-distro-shadow--${discordId}`
        )
        .setLabel(NM_NIGHT_ROLES['night-distro-shadow'].description)
        .setStyle(ButtonStyle.Secondary);
    const shadowPickupButton = new ButtonBuilder()
        .setCustomId(
            `volunteer-init--${
                day as string
            }--night-pickup-shaddow--${discordId}`
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
        .setCustomId(
            `volunteer-period--${day as string}--${role}--once--${discordId}`
        )
        .setLabel(`${NM_NIGHT_ROLES[role].name} just this ${day as string}`)
        .setStyle(ButtonStyle.Secondary);
    const joinAlwaysButton = new ButtonBuilder()
        .setCustomId(
            `volunteer--${day as string}--${role}--every--${discordId}`
        )
        .setLabel(`${NM_NIGHT_ROLES[role].name}  every ${day as string}`)
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

    const rows: Array<
        ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>
    > = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(
                    `volunteer-pickup-update--${day as string}--${discordId}`
                )
                .setPlaceholder('Make a selection!')
                .setMinValues(1)
                .setMaxValues(pickupList.length)
                .addOptions(
                    pickupList.map(
                        ({ orgPickup, timeStart, timeEnd, personList }) =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Pickup: ${orgPickup}`)
                                .setDescription(
                                    `at ${ParseContentService.getAmPmTimeFrom24Hour(
                                        timeStart
                                    )}${
                                        personList.length ? ' with ' : ''
                                    }${personList
                                        .map((a) => a.name)
                                        .join(', ')}`
                                )
                                .setValue(
                                    `${orgPickup}---${timeStart}---${
                                        timeEnd || '0000'
                                    }`
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
                        `volunteer-pickup-delete--${
                            day as string
                        }--${discordId}`
                    )
                    .setLabel(`Delete ${hasOwnPickups} Pickups`)
                    .setStyle(ButtonStyle.Secondary)
            )
        );
    }
    return rows;
}
export function GetVolunteerDistroComponent(
    { day, discordId }: Required<Pick<NightPersonModel, 'day' | 'discordId'>>,
    marketList: NightMarketModel[]
) {
    const hostList = [...marketList.map((a) => a.hostList)].flat();
    const hasOwnDistro = hostList.filter((a) =>
        hostList.some((b) => b.discordIdOrEmail === discordId)
    ).length;
    const personList = hostList.filter((a) => a.discordIdOrEmail !== discordId);

    const rows: Array<
        ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>
    > = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(
                    `volunteer-distro-update--${day as string}--${discordId}`
                )
                .setPlaceholder('Make a selection!')
                .setMinValues(1)
                .setMaxValues(hostList.length)
                .addOptions(
                    marketList.map(
                        ({ orgMarket, orgPickup, timeStart, timeEnd }) =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Host: ${orgMarket}`)
                                .setDescription(
                                    `at ${ParseContentService.getAmPmTimeFrom24Hour(
                                        timeStart
                                    )} with ${personList
                                        .filter(
                                            (a) => a.orgMarket === orgMarket
                                        )
                                        .map((a) => a.name)
                                        .join(', ')}`
                                )
                                .setValue(
                                    `${orgPickup}---${timeStart}---${
                                        timeEnd || '0000'
                                    }---${orgMarket}`
                                )
                    )
                )
        )
    ];

    if (hasOwnDistro) {
        rows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `volunteer-distro-delete--${
                            day as string
                        }--${discordId}`
                    )
                    .setLabel(`Delete ${hasOwnDistro} Distro`)
                    .setStyle(ButtonStyle.Secondary)
            )
        );
    }
    return rows;
}

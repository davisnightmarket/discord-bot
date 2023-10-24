import {
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES, PARTS_OF_DAY } from '../const';
import { NmDayNameType } from '../model';

export const AvailabilityEditButtonComponent = (discordId: string) => {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`availability--init-host--${discordId}`)
                .setLabel('Edit Hosting Availability')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`availability--init-pickup--${discordId}`)
                .setLabel('Edit Pickup Availability')
                .setStyle(ButtonStyle.Secondary)
        )
    ];
};

// selects to identify your availability for night ops
export const AvailabilityToHostComponent = (
    dayTimeList: [string, string][],
    discordId: string,
    defaultDayTimeList: string[]
) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`availability--night-distro--${discordId}`)

                .setMinValues(0)
                .setMaxValues(dayTimeList.length)
                .addOptions(
                    ...dayTimeList.map((dayTime) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(dayTime[1])
                            .setDefault(defaultDayTimeList.includes(dayTime[0]))

                            .setValue(dayTime[0]);
                    })
                )
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`availability--night-distro-clear--${discordId}`)
                .setLabel('Delete My Availability')
                .setStyle(ButtonStyle.Danger)
        )
    ];
};

// selects to identify your availability for night ops
export const AvailabilityToPickupDaySelectComponent = ({
    discordId
}: {
    discordId: string;
}) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(
                    `availability--night-pickup-day--none--${discordId}`
                )
                .addOptions(
                    ...DAYS_OF_WEEK_CODES.map((day) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`${DAYS_OF_WEEK[day].name}`)
                            .setDescription(
                                DAYS_OF_WEEK[day as NmDayNameType].description
                            )
                            .setValue(DAYS_OF_WEEK[day].id)
                    )
                )
        )
    ];
};

// selects to identify your availability for night ops
export const AvailabilityToPickupPerDaySelectComponent = ({
    day,
    discordId,
    defaultList
}: {
    day: NmDayNameType;
    discordId: string;
    defaultList: (keyof typeof PARTS_OF_DAY)[];
}) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`availability--night-pickup--${day}--${discordId}`)
                .setMinValues(0)
                .setMaxValues(Object.values(PARTS_OF_DAY).length)
                .addOptions(
                    ...Object.values(PARTS_OF_DAY).map((partOfDay) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(
                                `${DAYS_OF_WEEK[day as NmDayNameType].name} ${
                                    partOfDay.name
                                }`
                            )
                            .setDefault(defaultList.includes(partOfDay.id))
                            .setDescription(
                                DAYS_OF_WEEK[day as NmDayNameType].description
                            )
                            .setValue(`${day}|||${partOfDay.id}`)
                    )
                )
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `availability--night-pickup-clear-day--${day}--${discordId}`
                )
                .setLabel(`Delete ${DAYS_OF_WEEK[day].name} Availability`)
                .setStyle(ButtonStyle.Danger)
        )
    ];
};

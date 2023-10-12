import {
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { PersonModel } from '../service';
import { DAYS_OF_WEEK, PARTS_OF_DAY } from '../const';
import { NmDayNameType } from '../model';

export const AvailabilityEditButtonComponent = () => {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`availability--night-list`)
                .setLabel('Edit availability?')
                .setStyle(ButtonStyle.Secondary)
        )
    ];
};

// selects to identify your availability for night ops
export const AvailabilityToHostComponent = (
    dayTimeList: [string, string][],
    {}: PersonModel
) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`availability--night-host`)

                .setMinValues(0)
                .setMaxValues(dayTimeList.length)
                .addOptions(
                    ...dayTimeList.map((dayTime) => {
                        return (
                            new StringSelectMenuOptionBuilder()
                                .setLabel(dayTime[1])
                                // .setDescription(
                                //     DAYS_OF_WEEK[day as NmDayNameType]
                                //         .description
                                // )
                                .setValue(dayTime[0])
                        );
                    })
                )
        )
    ];
};

// selects to identify your availability for night ops
export const AvailabilityToPickupPerDayComponent = ({
    day
}: {
    day: NmDayNameType;
}) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`availability--night-pickup--${day}`)
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
                            .setDescription(
                                DAYS_OF_WEEK[day as NmDayNameType].description
                            )
                            .setValue(`${day}|||${partOfDay.id}`)
                    )
                )
        )
    ];
};

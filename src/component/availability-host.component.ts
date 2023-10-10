import {
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder
} from 'discord.js';
import { PersonModel } from '../service';
import { DAYS_OF_WEEK } from '../const';
import { NmDayNameType } from '../model';

// selects to identify your availability for night ops
export const AvailabilityHostComponent = (
    dayTimeList: [string, string][],
    {}: PersonModel
) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`availability--host}`)

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

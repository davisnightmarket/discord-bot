import {
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder
} from 'discord.js';
import { PersonModel } from '../service';
import { DAYS_OF_WEEK, PARTS_OF_DAY } from '../const';
import { NmDayNameType } from '../model';

// selects to identify your availability for night ops
export const AvailabilityPickupComponent = ({ discordId }: PersonModel) => {
    return Object.values(PARTS_OF_DAY).map((partOfDay) => {
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`availability--pickup--${partOfDay.id}`)

                .setMinValues(1)
                .setMaxValues(7)
                .addOptions(
                    ...Object.keys(DAYS_OF_WEEK).map((day) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(
                                `${DAYS_OF_WEEK[day as NmDayNameType].name} ${
                                    partOfDay.name
                                }`
                            )
                            .setDescription(
                                DAYS_OF_WEEK[day as NmDayNameType].description
                            )
                            .setValue(day)
                    )
                )
        );
    });

    // [
    //     new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    //         selectHostList
    //     ),
    //     new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    //         selectPickupList
    //     )
    // ]
    // const selectHostList: StringSelectMenuBuilder[] = Object.values(
    //     PARTS_OF_DAY
    // ).map((partOfDay) => {
    //     return new StringSelectMenuBuilder()
    //         .setCustomId(`identity-availability--host--${partOfDay.id}`)

    //         .setMinValues(1)
    //         .setMaxValues(7)
    //         .addOptions(
    //             ...Object.keys(DAYS_OF_WEEK).map((day) =>
    //                 new StringSelectMenuOptionBuilder()
    //                     .setLabel(
    //                         `Host ${DAYS_OF_WEEK[day as NmDayNameType].name} ${
    //                             partOfDay.name
    //                         }`
    //                     )
    //                     .setDescription(
    //                         DAYS_OF_WEEK[day as NmDayNameType].description
    //                     )
    //                     .setValue(day)
    //             )
    //         );
    // });

    // const selectPickupList: StringSelectMenuBuilder[] = Object.values(
    //     PARTS_OF_DAY
    // ).map((partOfDay) => {
    //     return new StringSelectMenuBuilder()
    //         .setCustomId(`identity-availability--pickup--${partOfDay.id}`)

    //         .setMinValues(1)
    //         .setMaxValues(7)
    //         .addOptions(
    //             ...Object.keys(DAYS_OF_WEEK).map((day) =>
    //                 new StringSelectMenuOptionBuilder()
    //                     .setLabel(
    //                         `Pickup ${
    //                             DAYS_OF_WEEK[day as NmDayNameType].name
    //                         } ${partOfDay.name}`
    //                     )
    //                     .setDescription(
    //                         DAYS_OF_WEEK[day as NmDayNameType].description
    //                     )
    //                     .setValue(day)
    //             )
    //         );
    // });

    // return rows;
};

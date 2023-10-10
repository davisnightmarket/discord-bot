"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityComponent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
// selects to identify your availability for night ops
const AvailabilityComponent = ({ discordId }) => {
    return Object.values(const_1.PARTS_OF_DAY).map((partOfDay) => {
        return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`identity-availability--host--${partOfDay.id}`)
            .setMinValues(1)
            .setMaxValues(7)
            .addOptions(...Object.keys(const_1.DAYS_OF_WEEK).map((day) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Host ${const_1.DAYS_OF_WEEK[day].name} ${partOfDay.name}`)
            .setDescription(const_1.DAYS_OF_WEEK[day].description)
            .setValue(day))));
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
exports.AvailabilityComponent = AvailabilityComponent;

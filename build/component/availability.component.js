"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityToPickupPerDayComponent = exports.AvailabilityToHostComponent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
// selects to identify your availability for night ops
const AvailabilityToHostComponent = (dayTimeList, {}) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`availability--night-host`)
            .setMinValues(0)
            .setMaxValues(dayTimeList.length)
            .addOptions(...dayTimeList.map((dayTime) => {
            return (new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(dayTime[1])
                // .setDescription(
                //     DAYS_OF_WEEK[day as NmDayNameType]
                //         .description
                // )
                .setValue(dayTime[0]));
        })))
    ];
};
exports.AvailabilityToHostComponent = AvailabilityToHostComponent;
// selects to identify your availability for night ops
const AvailabilityToPickupPerDayComponent = ({ day }) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`availability--night-pickup--${day}`)
            .setMinValues(0)
            .setMaxValues(Object.values(const_1.PARTS_OF_DAY).length)
            .addOptions(...Object.values(const_1.PARTS_OF_DAY).map((partOfDay) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`${const_1.DAYS_OF_WEEK[day].name} ${partOfDay.name}`)
            .setDescription(const_1.DAYS_OF_WEEK[day].description)
            .setValue(`${day}|||${partOfDay.id}`))))
    ];
};
exports.AvailabilityToPickupPerDayComponent = AvailabilityToPickupPerDayComponent;

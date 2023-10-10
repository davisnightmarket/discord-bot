"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityHostComponent = void 0;
const discord_js_1 = require("discord.js");
// selects to identify your availability for night ops
const AvailabilityHostComponent = (dayTimeList, {}) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`availability--host}`)
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
exports.AvailabilityHostComponent = AvailabilityHostComponent;

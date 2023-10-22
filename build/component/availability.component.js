"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityToPickupPerDayComponent = exports.AvailabilityToHostComponent = exports.AvailabilityEditButtonComponent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
const AvailabilityEditButtonComponent = (discordId) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`availability--init--${discordId}`)
            .setLabel('Edit availability?')
            .setStyle(discord_js_1.ButtonStyle.Secondary))
    ];
};
exports.AvailabilityEditButtonComponent = AvailabilityEditButtonComponent;
// selects to identify your availability for night ops
const AvailabilityToHostComponent = (dayTimeList, discordId, defaultDayTimeList) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`availability--night-distro--${discordId}`)
            .setMinValues(0)
            .setMaxValues(dayTimeList.length)
            .addOptions(...dayTimeList.map((dayTime) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(dayTime[1])
                .setDefault(defaultDayTimeList.includes(dayTime[0]))
                .setValue(dayTime[0]);
        }))),
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`availability--night-distro-none--${discordId}`)
            .setLabel('No availability')
            .setStyle(discord_js_1.ButtonStyle.Secondary))
    ];
};
exports.AvailabilityToHostComponent = AvailabilityToHostComponent;
// selects to identify your availability for night ops
const AvailabilityToPickupPerDayComponent = ({ day, discordId, defaultList }) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`availability--night-pickup--${day}--${discordId}`)
            .setMinValues(0)
            .setMaxValues(Object.values(const_1.PARTS_OF_DAY).length)
            .addOptions(...Object.values(const_1.PARTS_OF_DAY).map((partOfDay) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`${const_1.DAYS_OF_WEEK[day].name} ${partOfDay.name}`)
            .setDefault(defaultList.includes(partOfDay.id))
            .setDescription(const_1.DAYS_OF_WEEK[day].description)
            .setValue(`${day}|||${partOfDay.id}`)))),
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`availability--night-pickup-none--${day}--${discordId}`)
            .setLabel('No availability')
            .setStyle(discord_js_1.ButtonStyle.Secondary))
    ];
};
exports.AvailabilityToPickupPerDayComponent = AvailabilityToPickupPerDayComponent;

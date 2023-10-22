"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVolunteerPickupComponent = exports.GetVolunteerPeriodComponent = exports.GetVolunteerRoleShadowComponent = exports.GetVolunteerRoleComponent = exports.GetVolunteerListAllComponent = exports.GetVolunteerInitComponent = void 0;
const discord_js_1 = require("discord.js");
const service_1 = require("../service");
const const_1 = require("../const");
function GetVolunteerInitComponent({ discordId, day }) {
    const pickupButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-pickup--${day}--${discordId}`)
        .setLabel(`Volunteer the Pickup Button`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const hostButton = new discord_js_1.ButtonBuilder()
        // this is an "update" since we don't need more data, we can save this to db
        .setCustomId(`volunteer-distro-update--${day}--${discordId}`)
        .setLabel(`Volunteer the Distro Button`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder().addComponents(pickupButton, hostButton)
    ];
}
exports.GetVolunteerInitComponent = GetVolunteerInitComponent;
function GetVolunteerListAllComponent({ discordId, day }) {
    const editDayButton = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`volunteer-edit-day--${discordId}`)
        .setPlaceholder('')
        .addOptions(const_1.DAYS_OF_WEEK_CODES.map((d) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel(const_1.DAYS_OF_WEEK[d].name)
        .setDefault(day === d)
        .setDescription(``)
        .setValue(d)));
    return [
        new discord_js_1.ActionRowBuilder().addComponents(editDayButton)
    ];
}
exports.GetVolunteerListAllComponent = GetVolunteerListAllComponent;
function GetVolunteerRoleComponent({ day, discordId }) {
    const components = [];
    const hostButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-distro--${discordId}`)
        .setLabel(const_1.NM_NIGHT_ROLES['night-distro'].description)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const pickupButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-pickup--${discordId}`)
        .setLabel(const_1.NM_NIGHT_ROLES['night-pickup'].description)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder()
            .addComponents(hostButton)
            .addComponents(pickupButton)
    ];
}
exports.GetVolunteerRoleComponent = GetVolunteerRoleComponent;
function GetVolunteerRoleShadowComponent({ day, discordId }) {
    const components = [];
    const shadowHostButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-distro-shadow--${discordId}`)
        .setLabel(const_1.NM_NIGHT_ROLES['night-distro-shadow'].description)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const shadowPickupButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-init--${day}--night-pickup-shaddow--${discordId}`)
        .setLabel(const_1.NM_NIGHT_ROLES['night-pickup-shadow'].description)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder()
            .addComponents(shadowHostButton)
            .addComponents(shadowPickupButton)
    ];
}
exports.GetVolunteerRoleShadowComponent = GetVolunteerRoleShadowComponent;
function GetVolunteerPeriodComponent({ day, role, discordId }) {
    const joinOnceButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-period--${day}--${role}--once--${discordId}`)
        .setLabel(`${const_1.NM_NIGHT_ROLES[role].name} just this ${day}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const joinAlwaysButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--every--${discordId}`)
        .setLabel(`${const_1.NM_NIGHT_ROLES[role].name}  every ${day}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton)
    ];
}
exports.GetVolunteerPeriodComponent = GetVolunteerPeriodComponent;
function GetVolunteerPickupComponent({ day, discordId }, pickupList) {
    const hasOwnPickups = pickupList.filter((a) => a.personList.some((b) => b.discordIdOrEmail === discordId)).length;
    const rows = [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`volunteer-pickup-update--${day}--${discordId}`)
            .setPlaceholder('Make a selection!')
            .setMinValues(1)
            .setMaxValues(pickupList.length)
            .addOptions(pickupList.map(({ org, timeStart, timeEnd, personList }) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Pickup: ${org}`)
            .setDescription(`at ${service_1.ParseContentService.getAmPmTimeFrom24Hour(timeStart)}${personList.length ? ' with ' : ''}${personList.map((a) => a.name).join(', ')}`)
            .setValue(`${org}---${timeStart}---${timeEnd || '0000'}`))))
    ];
    if (hasOwnPickups) {
        rows.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`volunteer-pickup-delete--${day}--${discordId}`)
            .setLabel(`Delete ${hasOwnPickups} Pickups`)
            .setStyle(discord_js_1.ButtonStyle.Secondary)));
    }
    return rows;
}
exports.GetVolunteerPickupComponent = GetVolunteerPickupComponent;

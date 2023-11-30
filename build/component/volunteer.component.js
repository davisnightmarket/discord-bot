"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVolunteerDistroComponent = exports.GetVolunteerPickupComponent = exports.GetVolunteerPeriodComponent = exports.GetVolunteerRoleShadowComponent = exports.GetVolunteerListDayComponent = exports.GetVolunteerRoleComponent = exports.GetVolunteerInitComponent = void 0;
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
        .setCustomId(`volunteer-distro--${day}--${discordId}`)
        .setLabel(`Volunteer the Distro Button`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder().addComponents(pickupButton, hostButton)
    ];
}
exports.GetVolunteerInitComponent = GetVolunteerInitComponent;
function GetVolunteerRoleComponent({ discordId, day }) {
    const pickupButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer-pickup--${day}--${discordId}`)
        .setLabel(`Volunteer the Pickup Button`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const hostButton = new discord_js_1.ButtonBuilder()
        // this is an "update" since we don't need more data, we can save this to db
        .setCustomId(`volunteer-distro--${day}--${discordId}`)
        .setLabel(`Volunteer the Distro Button`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder().addComponents(pickupButton, hostButton)
    ];
}
exports.GetVolunteerRoleComponent = GetVolunteerRoleComponent;
function GetVolunteerListDayComponent({ discordId, day }) {
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
exports.GetVolunteerListDayComponent = GetVolunteerListDayComponent;
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
            .addOptions(pickupList.map(({ orgPickup, timeStart, timeEnd, personList }) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Pickup: ${orgPickup}`)
            .setDescription(`at ${service_1.ParseContentService.getAmPmTimeFrom24Hour(timeStart)}${personList.length ? ' with ' : ''}${personList
            .map((a) => a.name)
            .join(', ')}`)
            .setValue(`${orgPickup}---${timeStart}---${timeEnd || '0000'}`))))
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
function GetVolunteerDistroComponent({ day, discordId }, marketList) {
    const hostList = [...marketList.map((a) => a.hostList)].flat();
    const hasOwnDistro = hostList.filter((a) => hostList.some((b) => b.discordIdOrEmail === discordId)).length;
    const personList = hostList.filter((a) => a.discordIdOrEmail !== discordId);
    const rows = [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`volunteer-distro-update--${day}--${discordId}`)
            .setPlaceholder('Make a selection!')
            .setMinValues(1)
            .setMaxValues(hostList.length)
            .addOptions(marketList.map(({ orgMarket, orgPickup, timeStart, timeEnd }) => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Host: ${orgMarket}`)
            .setDescription(`at ${service_1.ParseContentService.getAmPmTimeFrom24Hour(timeStart)} with ${personList
            .filter((a) => a.orgMarket === orgMarket)
            .map((a) => a.name)
            .join(', ')}`)
            .setValue(`${orgPickup}---${timeStart}---${timeEnd || '0000'}---${orgMarket}`))))
    ];
    if (hasOwnDistro) {
        rows.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`volunteer-distro-delete--${day}--${discordId}`)
            .setLabel(`Delete ${hasOwnDistro} Distro`)
            .setStyle(discord_js_1.ButtonStyle.Secondary)));
    }
    return rows;
}
exports.GetVolunteerDistroComponent = GetVolunteerDistroComponent;

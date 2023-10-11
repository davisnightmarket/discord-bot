"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVolunteerPickupComponent = exports.GetVolunteerPeriodComponent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
function GetVolunteerPeriodComponent({ day, role }) {
    const joinOnceButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--once`)
        .setLabel(`${const_1.NM_NIGHT_ROLES[role].name} just this ${day}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const joinAlwaysButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--every`)
        .setLabel(`${const_1.NM_NIGHT_ROLES[role].name}  every ${day}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return [
        new discord_js_1.ActionRowBuilder()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton)
    ];
}
exports.GetVolunteerPeriodComponent = GetVolunteerPeriodComponent;
function GetVolunteerPickupComponent({ day, role, period }, pickupList) {
    const select = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`volunteer--${day}--${role}--${period}--org`)
        .setPlaceholder('Make a selection!')
        .addOptions(pickupList.map(({ org, timeStart, timeEnd, personList }) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel(org)
        .setDescription(`at ${timeStart}${personList.length ? ' with ' : ''}${personList.map((a) => a.name).join(', ')}`)
        .setValue(`${org}---${timeStart}---${timeEnd || '0000'}`)));
    return [
        new discord_js_1.ActionRowBuilder().addComponents(select)
    ];
}
exports.GetVolunteerPickupComponent = GetVolunteerPickupComponent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVolunteerPeriodComponent = void 0;
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

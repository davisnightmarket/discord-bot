"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerRequestEvent = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
const const_1 = require("../const");
// todo: split this into different events for clarity
// when a person requests a listing of
async function VolunteerRequestEvent({ nightDataService }, interaction) {
    const guild = interaction.guild;
    interaction = interaction;
    interaction.deferReply();
    let channelDay = (await guild?.channels?.fetch(interaction?.channelId ?? ''))?.name;
    channelDay = const_1.DAYS_OF_WEEK_CODES.includes(channelDay)
        ? channelDay
        : (0, utility_1.GetChannelDayToday)();
    const { pickupList } = await nightDataService.getNightByDay(channelDay);
    const components = [];
    const content = (0, utility_1.GetPickupJoinMessage)(pickupList);
    const joinOnceButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer--${channelDay}--night-distro`)
        .setLabel(const_1.NM_NIGHT_ROLES['night-distro'].description)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const joinAlwaysButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`volunteer--${channelDay}--night-pickup`)
        .setLabel(const_1.NM_NIGHT_ROLES['night-pickup'].description)
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    components.push(new discord_js_1.ActionRowBuilder()
        .addComponents(joinOnceButton)
        .addComponents(joinAlwaysButton));
    interaction.editReply({
        content,
        components
    });
}
exports.VolunteerRequestEvent = VolunteerRequestEvent;

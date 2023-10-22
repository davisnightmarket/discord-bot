"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightListRequestEvent = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
const const_1 = require("../const");
// when a person requests a listing of
async function NightListRequestEvent({ nightDataService }, guild, interaction) {
    if (interaction.isCommand()) {
        let channelDay = (await guild?.channels?.fetch(interaction?.channelId ?? ''))?.name;
        channelDay = const_1.DAYS_OF_WEEK.includes(channelDay)
            ? channelDay
            : (0, utility_1.GetChannelDayToday)();
        const { pickupList } = await nightDataService.getNightByDay(channelDay);
        const components = [];
        const content = (0, utility_1.GetPickupJoinMessage)(pickupList);
        const joinOnceButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`pickup--${channelDay}--host`)
            .setLabel(`Host Market`)
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const joinAlwaysButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`pickup--${channelDay}--pickup`)
            .setLabel('Pickup and Deliver Food')
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        components.push(new discord_js_1.ActionRowBuilder()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton));
        interaction.reply({
            content,
            components
        });
        return;
    }
    // for (const { org, timeStart } of pickupList) {
    //     // todo: create message per pickup
    // }
    if (interaction.isButton()) {
        const [command, day, role] = interaction?.customId.split('--');
        // some other button command
        if (command !== 'pickup') {
            return;
        }
        // there should always be a day
        if (day && const_1.DAYS_OF_WEEK.includes(day)) {
            console.error('Passed not a day');
            return;
        }
        const { pickupList, hostList } = await nightDataService.getNightByDay(day);
        if (role === 'night-pickup') {
            interaction.reply({
                content: 'pickup options'
            });
            return;
        }
        if (role === 'night-distro') {
            interaction.reply({
                content: 'host options'
            });
            return;
        }
        return;
    }
}
exports.NightListRequestEvent = NightListRequestEvent;

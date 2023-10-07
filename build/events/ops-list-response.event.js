"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpsListResponseEvent = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
const nm_const_1 = require("../nm-const");
// receives a response to a list request for ops:
// allows someone to sign up for pickup or host
async function OpsListResponseEvent({ nightDataService }, interaction, day) {
    let channelDay = day ?? interaction?.guild?.name;
    channelDay = nm_const_1.DAYS_OF_WEEK.includes(channelDay)
        ? channelDay
        : (0, utility_1.GetChannelDayToday)();
    const { pickupsList } = await nightDataService.getNightByDay(channelDay);
    const content = (0, utility_1.GetOpsAnnounceMessage)(await (0, utility_1.GetGuildRoleIdByName)(interaction.guild, channelDay), pickupsList);
    // todo: not sure we need a button. I think it's more likely folks will simply hit the / command again
    // rather than scroll up and hit a button, especially if there's been a lot of conversation since.
    const joinOnceButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`pickups-once--${channelDay}`)
        .setLabel('Join Once')
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const joinAlwaysButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`pickups-always--${channelDay}`)
        .setLabel('Join Once')
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    // // todo: only add a quit button if they are signed up
    // const quitButton = new ButtonBuilder()
    //     .setCustomId(`pickups-leave--${channelDay}`)
    //     .setLabel('Quit')
    //     .setStyle(ButtonStyle.Secondary);
    interaction.reply({
        content,
        components: [
            new discord_js_1.ActionRowBuilder()
                .addComponents(joinOnceButton)
                .addComponents(joinAlwaysButton)
        ],
        // if this is an interaction then it's come from
        // a slash command, so in that case we only want the
        // person who issued the command to see it
        // since we can have one or more cron based announcement for everyone else
        // this will prevent people spamming everyone every time
        // they want to see what the pickups are
        ephemeral: true
    });
}
exports.OpsListResponseEvent = OpsListResponseEvent;

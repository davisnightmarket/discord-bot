"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupsListEvent = exports.PickupJoinEvent = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
// when a person opts in to do a pickup or role per night
const PickupJoinEvent = async ({ opsDataService }, interaction) => {
    // Is this our interaction to deal with?
    interaction = interaction;
    const { customId } = interaction;
    if (!customId)
        return;
    const [name, day, time] = customId.split('--');
    if (name !== 'pickups-refresh')
        return;
    const guild = interaction.guild;
    if (!guild)
        return;
    // regenerate the message
    const channelDay = (0, utility_1.GetChannelDayToday)();
    const pickupsList = await opsDataService.getOpsByDay(channelDay);
    const content = createPickupsMessage(await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay), pickupsList);
    // update it
    interaction.message.edit(content);
    // TODO: update pickups list with new data
    opsDataService.updateOpsSheet({
        day,
        time
    });
};
exports.PickupJoinEvent = PickupJoinEvent;
// when a person requests a listing of
async function PickupsListEvent({ opsDataService, personCoreService }, guild, interaction) {
    const channelDay = (0, utility_1.GetChannelDayToday)();
    const pickupsList = await opsDataService.getOpsByDay(channelDay);
    const content = createPickupsMessage(await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay), pickupsList);
    if (interaction) {
        // todo: not sure we need a button. I think it's more likely folks will simply hit the / command again
        // rather than scroll up and hit a button, especially if there's been a lot of conversation since.
        const refreshButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`pickups-refresh--${channelDay}`)
            .setLabel('Refresh')
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(refreshButton);
        interaction.reply({
            content,
            components: [row],
            // if this is an interaction then it's come from
            // a slash command, so in that case we only want the
            // person who issued the command to see it
            // since we can have one or more cron based announcement for everyone else
            // this will prevent people spamming everyone every time
            // they want to see what the pickups are
            ephemeral: true
        });
    }
    else {
        const channel = (0, utility_1.GetChannelByName)(channelDay);
        channel.send(content);
    }
}
exports.PickupsListEvent = PickupsListEvent;
// todo: move this to the message service
function createPickupsMessage(roleId, ops) {
    return ops.reduce((message, o) => {
        message += `${(0, discord_js_1.bold)(o.org)} at ${o.timeStart}\n`;
        o.personList
            .filter((a) => a.role === 'night-pickup')
            .forEach((person) => {
            message += `> ${(0, discord_js_1.bold)(person.name)} ${person.discordId ? (0, discord_js_1.userMention)(person.discordId) : ''}\n`;
        });
        return message;
    }, `## ${(0, discord_js_1.roleMention)(roleId)} pickups!\n\n`);
}
// todo: does it make sense to create a thread when there's a dedicated channel?
// async function createTodaysPickupThread(guild: Guild) {
//     const channel = GetChannelByName(guild, GetChannelDayToday());
//     const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
//     return await channel.threads.create({ name });
// }

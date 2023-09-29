"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyPickupsWithoutThread = exports.PickupsRefreshEvent = void 0;
const discord_js_1 = require("discord.js");
const service_1 = require("../service");
const nm_const_1 = require("../nm-const");
const PickupsRefreshEvent = (sevicesConfig) => async (interaction) => {
    // Is this our interaction to deal with?
    interaction = interaction;
    const { customId } = interaction;
    if (!customId)
        return;
    const [name, day] = customId.split('--');
    if (name !== "pickups-refresh")
        return;
    // Get em services
    const guild = interaction.guild;
    if (!guild)
        return;
    const services = await sevicesConfig.getServicesForGuildId(guild.id);
    // make sure we have the most up to date info
    await services.pickupsDataService.updateCache();
    // regenerate the message
    const roleId = await getRoleByName(guild, day);
    let message = `## ${(0, discord_js_1.roleMention)(roleId)} pickups!\n`;
    const pickups = await services.pickupsDataService.getPickupsFor(day);
    for (const pickup of pickups) {
        message += `> ${(0, discord_js_1.bold)(pickup.org)} at ${pickup.time}: ${await getVolunteerList(guild, services, pickup)}\n`;
    }
    // update it
    interaction.message.edit(message);
};
exports.PickupsRefreshEvent = PickupsRefreshEvent;
async function DailyPickupsWithoutThread(guild, services, interaction) {
    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today());
    // list all the pick ups happening today
    const pickups = await services.pickupsDataService.getPickupsFor(today());
    let message = `## ${(0, discord_js_1.roleMention)(roleId)} pickups!\n`;
    for (const pickup of pickups) {
        message += `> ${(0, discord_js_1.bold)(pickup.org)} at ${pickup.time}: ${await getVolunteerList(guild, services, pickup)}\n`;
    }
    if (interaction) {
        const editButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`pickups-edit--${today()}`)
            .setLabel('Edit')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const helpButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`pickups-help--${today()}`)
            .setLabel('Help')
            .setStyle(discord_js_1.ButtonStyle.Success);
        const refreshButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`pickups-refresh--${today()}`)
            .setLabel('Refresh')
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(editButton, helpButton, refreshButton);
        interaction.reply({
            content: message,
            components: [row],
        });
    }
    else {
        const channel = (0, service_1.getChannelByName)(guild, today());
        channel.send(message);
    }
}
exports.DailyPickupsWithoutThread = DailyPickupsWithoutThread;
async function getVolunteerList(guild, services, pickup) {
    const people = await Promise.all([pickup.volunteer1, pickup.volunteer2, pickup.volunteer3]
        .filter((name) => name !== undefined && name !== '' && name !== "NEEDED")
        .map(async (name) => (await services.personCoreService.getPerson({ name })) ?? {
        name
    }));
    if (people.length === 0)
        return (0, discord_js_1.roleMention)(await getRoleByName(guild, "NEEDED"));
    return people
        .filter((person) => !!person)
        .map((person) => person.discordId ? (0, discord_js_1.userMention)(person.discordId) : person.name)
        .join(', ');
}
async function createTodaysPickupThread(guild) {
    const channel = (0, service_1.getChannelByName)(guild, today());
    const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
    return await channel.threads.create({ name });
}
async function getRoleByName(guild, name) {
    const role = guild.roles.cache.find((role) => role.name === name);
    if (!role)
        return await guild.roles.create({ name }).then((role) => role.id);
    return role.id;
}
function today() {
    return nm_const_1.DAYS_OF_WEEK[new Date().getDay()];
}

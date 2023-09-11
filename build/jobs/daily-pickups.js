"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyPickupsThread = exports.DailyPickupsWithoutThread = exports.DailyPickupsUsingEmbed = void 0;
const discord_js_1 = require("discord.js");
const service_1 = require("../service");
const nm_const_1 = require("../nm-const");
async function DailyPickupsUsingEmbed(guild, services) {
    const channel = (0, service_1.getChannelByName)(guild, today());
    const pickups = await services.pickupsDataService.getPickupsFor(today());
    const pickupDescriptions = await Promise.all(pickups.map(async (pickup) => `* [${pickup.org}](https://www.example.com) at ${pickup.time}: ${await getVolunteerList(services, pickup)}`));
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`pickups`)
        .setDescription(pickupDescriptions.join('\n'));
    channel.send({ embeds: [embed] });
}
exports.DailyPickupsUsingEmbed = DailyPickupsUsingEmbed;
async function DailyPickupsWithoutThread(guild, services) {
    const channel = (0, service_1.getChannelByName)(guild, today());
    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today()).then((role) => role.id);
    channel.send(`Lets go ${(0, discord_js_1.roleMention)(roleId)}!`);
    const link = 'https://davisnightmarket.github.io/';
    // list all the pick ups happening today
    const pickups = await services.pickupsDataService.getPickupsFor(today());
    for (const pickup of pickups) {
        channel.send([
            `${(0, discord_js_1.bold)(pickup.org)} at ${pickup.time}: ${await getVolunteerList(services, pickup)}`
        ].join('\n'));
    }
}
exports.DailyPickupsWithoutThread = DailyPickupsWithoutThread;
async function DailyPickupsThread(guild, services) {
    const thread = await createTodaysPickupThread(guild);
    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today()).then((role) => role.id);
    thread.send(`Lets go ${(0, discord_js_1.roleMention)(roleId)}!`);
    // list all the pick ups happening today
    const pickups = await services.pickupsDataService.getPickupsFor(today());
    for (const pickup of pickups) {
        thread.send([
            `${(0, discord_js_1.bold)(pickup.org)} at ${pickup.time}. ${pickup.comments ?? ''}`,
            ``,
            `people helping: ${await getVolunteerList(services, pickup)}`,
            ``
        ].join('\n'));
    }
}
exports.DailyPickupsThread = DailyPickupsThread;
async function getVolunteerList(services, pickup) {
    const people = await Promise.all([pickup.volunteer1, pickup.volunteer2, pickup.volunteer3]
        .filter((name) => name !== undefined && name !== '')
        .map(async (name) => (await services.personCoreService.getPerson({ name })) ?? {
        name
    }));
    if (people.length === 0)
        return (0, discord_js_1.bold)('NEEDED');
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
        return await guild.roles.create({ name });
    return role;
}
function today() {
    return nm_const_1.DAYS_OF_WEEK[new Date().getDay()];
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOpsJoinMessage = exports.GetOpsAnnounceMessage = exports.GetChannelDayYesterday = exports.GetChannelDayToday = void 0;
const discord_js_1 = require("discord.js");
const nm_const_1 = require("../nm-const");
// import { type NmDayNameType, type GuildServiceModel } from '../model';
// import { type PersonModel, type PickUp } from '../service';
const GetChannelDayToday = (date = new Date()) => {
    return nm_const_1.DAYS_OF_WEEK[date.getDay()];
};
exports.GetChannelDayToday = GetChannelDayToday;
const GetChannelDayYesterday = (date = new Date()) => {
    return nm_const_1.DAYS_OF_WEEK[date.getDay() - 1] || nm_const_1.DAYS_OF_WEEK[6];
};
exports.GetChannelDayYesterday = GetChannelDayYesterday;
// todo: use message service
function GetOpsAnnounceMessage(roleId, ops) {
    return ops.reduce((message, o) => {
        return (message +
            `${o.personList
                .map((person) => {
                return `${(0, discord_js_1.bold)(person.name)} ${person.discordId ? (0, discord_js_1.userMention)(person.discordId) : ''}`;
            })
                .join(', ')}${(0, discord_js_1.bold)(o.org)} at ${o.timeStart}\n`);
    }, `## ${(0, discord_js_1.roleMention)(roleId)} pickups!\n`);
}
exports.GetOpsAnnounceMessage = GetOpsAnnounceMessage;
// todo: use message service
function GetOpsJoinMessage(roleId, { org, timeStart, personList }) {
    return `## ${(0, discord_js_1.roleMention)(roleId)} pickup:\n${personList
        .map((person) => {
        return `${(0, discord_js_1.bold)(person.name)} ${person.discordId ? (0, discord_js_1.userMention)(person.discordId) : ''}`;
    })
        .join(', ')} ${(0, discord_js_1.bold)(org)} at ${timeStart}\n`;
}
exports.GetOpsJoinMessage = GetOpsJoinMessage;
// export const PickupsRefreshEvent =
//     (sevicesConfig: ConfigService) => async (interaction: Interaction) => {
//         // Is this our interaction to deal with?
//         interaction = interaction as ButtonInteraction;
//         const { customId } = interaction;
//         if (!customId) return;
//         const [name, day] = customId.split('--');
//         if (name !== 'pickups-refresh') return;
//         // Get em services
//         const guild = interaction.guild;
//         if (!guild) return;
//         const services = await sevicesConfig.getServicesForGuildId(guild.id);
//         // regenerate the message
//         const roleId = await getRoleByName(guild, day);
//         let message = `## ${roleMention(roleId)} pickups!\n`;
//         const pickups = await services.nightDataService.getNightByDay(
//             day as NmDayNameType
//         );
//         for (const pickup of pickups) {
//             message += `> ${bold(pickup.org)} at ${
//                 pickup.time
//             }: ${await getVolunteerList(guild, services, pickup)}\n`;
//         }
//         // update it
//         interaction.message.edit(message);
//     };
// export async function PickupsWithoutThread(
//     guild: Guild,
//     services: GuildServiceModel,
//     interaction?: ChatInputCommandInteraction
// ) {
//     // ping everyone signed up to help with today
//     const roleId = await getRoleByName(guild, today());
//     // list all the pick ups happening today
//     const pickups = await services.nightDataService.getNightByDay(today());
//     let message = `## ${roleMention(roleId)} pickups!\n`;
//     for (const pickup of pickups) {
//         message += `> ${bold(pickup.org)} at ${
//             pickup.time
//         }: ${await getVolunteerList(guild, services, pickup)}\n`;
//     }
//     if (interaction) {
//         const refreshButton = new ButtonBuilder()
//             .setCustomId(`pickups-refresh--${today()}`)
//             .setLabel('Refresh')
//             .setStyle(ButtonStyle.Secondary);
//         const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
//             refreshButton
//         );
//         interaction.reply({
//             content: message,
//             components: [row]
//         });
//     } else {
//         const channel = GetChannelByName(guild, today());
//         channel.send(message);
//     }
// }
// async function getPickupPersonList(nameList: string[]) {
//     return nameList
//         .filter((name) => name && name !== 'NEEDED')
//         .map(
//             async (name) =>
//                 (await services.personCoreService.getPerson({ name })) ?? {
//                     name
//                 }
//         );
// }
// async function createPickupsMessage(
//     roleId: string,
//     pickups: Pickup[],
//     personList: [],
//     guild
// ): string {
//     let personMessage: string;
//     if (personList.length === 0) {
//         personMessage = roleMention(await getRoleByName(guild, 'NEEDED'));
//     } else {
//         personMessage = personList
//             .map((person) =>
//                 person.discordId ? userMention(person.discordId) : person.name
//             )
//             .join(', ');
//     }
//     // adds people to the pickup
//     return `## ${roleMention(roleId)} pickups!\n> ${bold(pickup.org)} at ${
//         pickup.time
//     }: ${personMessage}\n`;
// }
// async function createTodaysPickupThread(guild: Guild) {
//     const channel = getChannelByName(guild, today());
//     const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
//     return await channel.threads.create({ name });
// }

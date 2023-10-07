import {
    roleMention,
    type Guild,
    bold,
    userMention,
    type ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    type Interaction
} from 'discord.js';

import { type NightModel } from '../service';

import { DAYS_OF_WEEK } from '../nm-const';
// import { type NmDayNameType, type GuildServiceModel } from '../model';
// import { type PersonModel, type PickUp } from '../service';

export const GetChannelDayToday = (date = new Date()) => {
    return DAYS_OF_WEEK[date.getDay()];
};
export const GetChannelDayYesterday = (date = new Date()) => {
    return DAYS_OF_WEEK[date.getDay() - 1] || DAYS_OF_WEEK[6];
};

// todo: use message service
export function GetOpsAnnounceMessage(
    roleId: string,
    ops: NightModel[]
): string {
    return ops.reduce((message, o) => {
        return (
            message +
            `${o.personList
                .map((person) => {
                    return `${bold(person.name)} ${
                        person.discordId ? userMention(person.discordId) : ''
                    }`;
                })
                .join(', ')}${bold(o.org)} at ${o.timeStart}\n`
        );
    }, `## ${roleMention(roleId)} pickups!\n`);
}

// todo: use message service
export function GetOpsJoinMessage(
    roleId: string,
    { org, timeStart, personList }: NightModel
): string {
    return `## ${roleMention(roleId)} pickup:\n${personList
        .map((person) => {
            return `${bold(person.name)} ${
                person.discordId ? userMention(person.discordId) : ''
            }`;
        })
        .join(', ')} ${bold(org)} at ${timeStart}\n`;
}

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

import { DAYS_OF_WEEK_CODES } from '../const';
// import { type NmDayNameType, type GuildServiceModel } from '../model';
// import { type PersonModel, type PickUp } from '../service';

export const GetChannelDayToday = (date = new Date()) => {
    return DAYS_OF_WEEK_CODES[
        // because Monday is the first day of the week
        date.getDay() ? date.getDay() - 1 : 6
    ];
};
export const GetChannelDayYesterday = (date = new Date()) => {
    return DAYS_OF_WEEK_CODES[date.getDay() - 1] || DAYS_OF_WEEK_CODES[6];
};

// export function GetPickupJoinMessage(pickupList: NightPickupModel[]) {
//     return pickupList
//         .map(
//             ({ org, timeStart, personList }) =>
//                 `## ${org} at ${timeStart} with ${personList
//                     .map((a) => a.name)
//                     .join(', ')} `
//         )
//         .join('\n');
// }

// export function GetAnnounceMessage(
//     roleId: string,
//     nightMap: NightModel
// ): string {
//     return (
//         `## ${getRandoSalute()} ${roleMention(roleId)}!\n` +
//         '\n' +
//         GetNightCapMessage(nightMap) +
//         '\n' +
//         GetHostMessage(nightMap) +
//         '\n' +
//         GetPickupsMessage(nightMap)
//     );
// }

// const saluteList: string[] = ['Hellooo', 'Holla', 'Dear', 'Dearest', 'Darling'];
// function getRandoSalute() {
//     return saluteList[Math.floor(Math.random() * saluteList.length)];
// }
// // todo: use message service
// export function GetAfterMarketMessage(
//     roleId: string,
//     { pickupList }: NightModel
// ): string {
//     return `## ${roleMention(
//         roleId
//     )}!\nNight herstory has been recorded! New night list: \n${pickupList
//         .map(({ org, timeStart, personList }) => {
//             return (
//                 '>> ' +
//                 org +
//                 ' ' +
//                 timeStart +
//                 ' ' +
//                 personList
//                     .map(
//                         ({ name, discordId }) =>
//                             `${bold(name)} ${
//                                 discordId ? userMention(discordId) : ''
//                             }`
//                     )
//                     .join(', ')
//             );
//         })
//         .join('\n')}`;
// }
// // todo: use message service
// export function GetPickupsMessage({ pickupList }: NightModel): string {
//     return `Pickups\n${pickupList
//         .map(({ org, timeStart, personList }) => {
//             return (
//                 '>> ' +
//                 org +
//                 ' ' +
//                 timeStart +
//                 ' ' +
//                 personList
//                     .map(
//                         ({ name, discordId }) =>
//                             `${bold(name)} ${
//                                 discordId ? userMention(discordId) : ''
//                             }`
//                     )
//                     .join(', ')
//             );
//         })
//         .join('\n')}`;
// }

// // todo: use message service
// export function GetNightCapMessage({ day, hostList }: NightModel): string {
//     const nightCapList = hostList.filter((a) => a.role === 'night-captain');
//     if (!nightCapList.length) {
//         return 'Night Cap NEEDED! Talk to a CC';
//     }
//     return `Night Captain${nightCapList.length > 1 ? 's' : ''}: ${nightCapList
//         .map((p) => (p.discordId ? userMention(p.discordId) : p.name))
//         .join(', ')}`;
// }

// // todo: use message service
// export function GetHostMessage({ hostList }: NightModel): string {
//     const a = hostList.filter((a) => a.role === 'night-distro');
//     return `Host${a.length > 1 ? 's' : ''}: ${a
//         .map(
//             ({ name, discordId }) =>
//                 `${bold(name)} ${discordId ? userMention(discordId) : ''}`
//         )
//         .join(', ')} `;
// }

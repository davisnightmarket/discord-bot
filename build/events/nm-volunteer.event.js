"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerHostSaveButtonEvent = exports.VolunteerPickupDeleteButtonEvent = exports.VolunteerPickupSaveSelectEvent = exports.VolunteerPickupButtonEvent = exports.VolunteerCommandEvent = void 0;
const volunteer_component_1 = require("../component/volunteer.component");
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('VolunteerEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
async function VolunteerCommandEvent({ nightDataService, markdownService }, interaction, discordId) {
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });
    // get the channel day or otherwise the current day
    const day = (await (0, utility_1.GetChannelDayNameFromInteraction)(interaction)) ||
        (0, utility_1.GetChannelDayToday)();
    // get
    const nightMap = await nightDataService.getNightByDay(day, {
        refreshCache: true
    });
    // TODO: some logic here to figure out:
    // check their history to see if they
    // need to shadow -- this can be done with NightPerson Status in night data
    await interaction.editReply({
        content: markdownService.getNightOpsEphemeral(day, discordId, nightMap),
        components: (0, volunteer_component_1.GetVolunteerInitComponent)({
            day,
            discordId
        })
    });
}
exports.VolunteerCommandEvent = VolunteerCommandEvent;
// when they hit the pickup button, the editing begins
async function VolunteerPickupButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup') {
        return;
    }
    dbg('volunteer-pickup', [command, day, discordId]);
    interaction.deferReply({ ephemeral: true });
    const nightMap = await nightDataService.getNightByDay(day);
    const { pickupList } = nightMap;
    if (pickupList.length) {
        const components = (0, volunteer_component_1.GetVolunteerPickupComponent)({
            day,
            discordId
        }, pickupList);
        interaction.editReply({
            content: `Replace pick-ups:\n ${markdownService.getMyPickups(discordId, nightMap)} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
        return;
    }
    await interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });
}
exports.VolunteerPickupButtonEvent = VolunteerPickupButtonEvent;
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
async function VolunteerPickupSaveSelectEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    const addList = nightDataService.getNightDataDiscordSelectValues(interaction.values, {
        day,
        role: 'night-pickup',
        discordIdOrEmail: discordId,
        periodStatus: 'ALWAYS'
    });
    dbg(`Adding ${addList.length} records`);
    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, addList);
    const nightMap = await nightDataService.getNightByDay(day, {
        refreshCache: true
    });
    console.log(JSON.stringify(nightMap, null, 2));
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!\n' + markdownService.getMyPickups(discordId, nightMap)
    });
}
exports.VolunteerPickupSaveSelectEvent = VolunteerPickupSaveSelectEvent;
async function VolunteerPickupDeleteButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // todo: make sure we are only sending addList for this discordId and day?
    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, []);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerPickupDeleteButtonEvent = VolunteerPickupDeleteButtonEvent;
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
async function VolunteerHostSaveButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-distro-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    const nightMap = await nightDataService.getNightByDay(day, {
        refreshCache: true
    });
    const { org, timeStart, timeEnd } = nightMap;
    await nightDataService.addHostForOnePersonAndDay(day, discordId, [
        {
            day,
            role: 'night-distro',
            discordIdOrEmail: discordId,
            periodStatus: 'ALWAYS',
            org,
            timeStart,
            timeEnd
        }
    ]);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerHostSaveButtonEvent = VolunteerHostSaveButtonEvent;
// here the user has chosen to pickup
// export async function VolunteerEditDaySelectEvent(
//     { nightDataService, markdownService }: GuildServiceModel,
//     interaction: StringSelectMenuInteraction,
//     discordId: string,
//     [command, day, role]: [string, NmDayNameType, NmNightRoleType, string]
// ) {
//     if (command !== 'volunteer-edit-day') {
//         return;
//     }
//     dbg(command, day, role, discordId);
//     interaction.deferReply({ ephemeral: true });
//     const { pickupList } = await nightDataService.getNightByDay(day);
//     const components = GetVolunteerRoleComponent({
//         day,
//         discordId
//     });
//     await interaction.editReply({
//         content: `OK, what would you like to do on ${day}?`,
//         components
//     });
// }
// // here the user has chosen to pickup
// export async function VolunteerEditPickupButtonEvent(
//     { nightDataService }: GuildServiceModel,
//     interaction: ButtonInteraction,
//     [command, day, role, discordId]: [
//         string,
//         NmDayNameType,
//         NmNightRoleType,
//         string
//     ]
// ) {
//     if (command !== 'volunteer-pickup') {
//         return;
//     }
//     dbg(command, day, role, discordId);
//     interaction.deferReply({ ephemeral: true });
//     const { pickupList } = await nightDataService.getNightByDay(day);
//     //     console.log('NIGHT PICKUP', pickupList);
//     const components = GetVolunteerPickupComponent(
//         {
//             day,
//             discordId
//         },
//         pickupList
//     );
//     interaction.editReply({
//         content: 'OK, all set!',
//         components
//     });
// }
// // // here the user has chosen to host
// // export async function VolunteerEditHostSelectEvent(
// //     { nightDataService, markdownService }: GuildServiceModel,
// //     interaction: ButtonInteraction,
// //     [command, day, role, discordId]: [
// //         string,
// //         NmDayNameType,
// //         NmNightRoleType,
// //         string
// //     ]
// // ) {
// //     if (command !== 'volunteer-save') {
// //         return;
// //     }
// //     dbg(command, day, role, discordId);
// //     interaction.deferReply({ ephemeral: true });
// //     await nightDataService.addNightData([
// //         {
// //             day,
// //             org: '', // this should be Davis Night Market in Central Park
// //             role,
// //             discordIdOrEmail: interaction.user.id,
// //             period: 'always',
// //             // both of these should be got from core data
// //             timeStart: '2100',
// //             timeEnd: ''
// //         }
// //     ]);
// //     // succcess!
// //     interaction.editReply({
// //         content: 'OK, all set!'
// //     });
// // }
// // here the user has chosen to host
// export async function VolunteerRoleEditEvent(
//     { nightDataService, markdownService }: GuildServiceModel,
//     interaction: ButtonInteraction,
//     [command, day, role, discordId]: [
//         string,
//         NmDayNameType,
//         NmNightRoleType,
//         string
//     ]
// ) {
//     if (command !== 'volunteer-host') {
//         return;
//     }
//     dbg(command, day, role, discordId);
//     interaction.deferReply({ ephemeral: true });
//     await nightDataService.addNightData([
//         {
//             day,
//             org: '', // this should be Davis Night Market in Central Park
//             role,
//             discordIdOrEmail: interaction.user.id,
//             period: 'always',
//             // both of these should be got from core data
//             timeStart: '2100',
//             timeEnd: ''
//         }
//     ]);
//     // succcess!
//     await interaction.editReply({
//         content: 'OK, all set!'
//     });
// }

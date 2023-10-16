"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerPickupOrgEvent = exports.VolunteerRoleEditEvent = exports.VolunteerEditPickupSelectEvent = exports.VolunteerEditDaySelectEvent = exports.VolunteerInitButtonEvent = exports.VolunteerCommandEvent = void 0;
const volunteer_component_1 = require("../component/volunteer.component");
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('VolunteerResponseEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
async function VolunteerCommandEvent({ nightDataService, markdownService }, interaction, discordId) {
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });
    const day = (await (0, utility_1.GetChannelDayNameFromInteraction)(interaction)) ||
        (0, utility_1.GetChannelDayToday)();
    // todo: get all night ops, not just one day?
    const night = await nightDataService.getNightByDay(day);
    const { pickupList } = night;
    // TODO: some logic here to figure out:
    // Is there a current commitment set? If so display it
    // If not, skip it and  show the role options
    // however, also check their history to see if they
    // need to shadow
    interaction.editReply({
        content: markdownService.md.VOLUNTEER_LIST({
            //todo: get all and my
            pickupList: nightDataService.getPickupListMd(pickupList),
            hostList: nightDataService.getHostListMd(night),
            myPickupList: nightDataService.getPickupListMd(pickupList),
            myHostList: nightDataService.getHostListMd(night)
        }),
        components: (0, volunteer_component_1.GetVolunteerInitComponent)({ day, discordId })
    });
}
exports.VolunteerCommandEvent = VolunteerCommandEvent;
// when they hit the init button, the editing begins,
// same as a above when they have no commitments
async function VolunteerInitButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day, role]) {
    if (command !== 'volunteer-init') {
        return;
    }
    dbg('volunteer-init', command);
    interaction.deferReply({ ephemeral: true });
    const { pickupList } = await nightDataService.getNightByDay(day);
    if (pickupList.length) {
        const components = (0, volunteer_component_1.GetVolunteerPickupComponent)({
            day,
            role,
            discordId
        }, pickupList);
        interaction.editReply({
            content: 'Choose pickups:',
            components
        });
        return;
    }
    interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });
    return;
}
exports.VolunteerInitButtonEvent = VolunteerInitButtonEvent;
// here the user has chosen to pickup
async function VolunteerEditDaySelectEvent({ nightDataService, markdownService }, interaction, [command, day, role, discordId]) {
    if (command !== 'volunteer-edit-day') {
        return;
    }
    dbg(command, day, role, discordId);
    interaction.deferReply({ ephemeral: true });
    const { pickupList } = await nightDataService.getNightByDay(day);
    const components = (0, volunteer_component_1.GetVolunteerRoleComponent)({
        day,
        discordId
    });
    interaction.editReply({
        content: `OK, what would you like to do on ${day}?`,
        components
    });
}
exports.VolunteerEditDaySelectEvent = VolunteerEditDaySelectEvent;
// here the user has chosen to pickup
async function VolunteerEditPickupSelectEvent({ nightDataService, markdownService }, interaction, [command, day, role, discordId]) {
    if (command !== 'volunteer-pickup') {
        return;
    }
    dbg(command, day, role, discordId);
    interaction.deferReply({ ephemeral: true });
    const { pickupList } = await nightDataService.getNightByDay(day);
    //     console.log('NIGHT PICKUP', pickupList);
    const components = (0, volunteer_component_1.GetVolunteerPickupComponent)({
        day,
        role,
        discordId
    }, pickupList);
    interaction.editReply({
        content: 'OK, all set!',
        components
    });
}
exports.VolunteerEditPickupSelectEvent = VolunteerEditPickupSelectEvent;
// // here the user has chosen to host
// export async function VolunteerEditHostSelectEvent(
//     { nightDataService, markdownService }: GuildServiceModel,
//     interaction: ButtonInteraction,
//     [command, day, role, discordId]: [
//         string,
//         NmDayNameType,
//         NmNightRoleType,
//         string
//     ]
// ) {
//     if (command !== 'volunteer-save') {
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
//     interaction.editReply({
//         content: 'OK, all set!'
//     });
// }
// here the user has chosen to host
async function VolunteerRoleEditEvent({ nightDataService, markdownService }, interaction, [command, day, role, discordId]) {
    if (command !== 'volunteer-host') {
        return;
    }
    dbg(command, day, role, discordId);
    interaction.deferReply({ ephemeral: true });
    await nightDataService.addNightData([
        {
            day,
            org: '',
            role,
            discordIdOrEmail: interaction.user.id,
            period: 'always',
            // both of these should be got from core data
            timeStart: '2100',
            timeEnd: ''
        }
    ]);
    // succcess!
    interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerRoleEditEvent = VolunteerRoleEditEvent;
async function VolunteerPickupOrgEvent({ nightDataService, markdownService }, interaction, [command, day, role, discordId]) {
    if (command !== 'volunteer-pickup-org') {
        return;
    }
    dbg(command, day, role, discordId);
    interaction.deferReply({ ephemeral: true });
    await nightDataService.addNightData([
        {
            day,
            org: '',
            role,
            discordIdOrEmail: interaction.user.id,
            period: 'always',
            // both of these should be got from core data
            timeStart: '2100',
            timeEnd: ''
        }
    ]);
    // succcess!
    interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerPickupOrgEvent = VolunteerPickupOrgEvent;

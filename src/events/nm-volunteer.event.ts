import {
    type ButtonInteraction,
    StringSelectMenuInteraction,
    ChatInputCommandInteraction,
    AnySelectMenuInteraction
} from 'discord.js';

import { type NmDayNameType, NmNightRoleType } from '../model';
import {
    GetVolunteerInitComponent,
    GetVolunteerPickupComponent
} from '../component/volunteer.component';
import {
    Dbg,
    GetChannelDayNameFromInteraction,
    GetChannelDayToday,
    type GuildServiceModel
} from '../utility';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES } from '../const';
import { NightOpsDataModel } from '../service';

const dbg = Dbg('VolunteerEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
export async function VolunteerCommandEvent(
    { nightDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    // get the channel day or otherwise the current day
    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ||
        GetChannelDayToday();

    // get

    const night = await nightDataService.getNightByDay(day);

    const { pickupList, hostList } = night;

    const myPickupList = pickupList.filter(
        // only pickups that I am doing
        (pickup) =>
            pickup.personList.filter((a) => a.discordId === discordId).length
    );

    // TODO: some logic here to figure out:
    // Is there a current commitment set? If so display it
    // If not, skip it and  show the role options
    // however, also check their history to see if they
    // need to shadow

    await interaction.editReply({
        content: markdownService.md.VOLUNTEER_LIST({
            dayName: DAYS_OF_WEEK[day].name,
            dayChannelNameList: DAYS_OF_WEEK_CODES.join(', '),
            //todo: get all and my
            nightCapList: nightDataService.getNightCapListMd(
                hostList,
                discordId
            ),
            hostList: nightDataService.getHostListMd(hostList, discordId),
            pickupList: nightDataService.getPickupListMd(pickupList),
            myPickupList: nightDataService.getPickupListMd(myPickupList)
        }),

        components: GetVolunteerInitComponent({ day, discordId })
    });
}

// when they hit the init button, the editing begins,
// same as a above when they have no commitments
export async function VolunteerPickupButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, NmNightRoleType, string]
) {
    if (command !== 'volunteer-pickup') {
        return;
    }

    dbg('volunteer-pickup', [command, day, discordId]);

    interaction.deferReply({ ephemeral: true });

    const { pickupList } = await nightDataService.getNightByDay(day);

    if (pickupList.length) {
        const components = GetVolunteerPickupComponent(
            {
                day,
                discordId
            },
            pickupList
        );
        interaction.editReply({
            content: 'Choose pickups:',
            components
        });
        return;
    }

    await interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });

    return;
}

// this fires when a select interaction to choose pickups is triggered
// it is complicated by the fact that the select is the complete set of
// pickups for that day and person - it replaces all records for that day/person
export async function VolunteerPickupSaveSelectEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: AnySelectMenuInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-pickup-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    const addList = nightDataService.getNightDataDiscordSelectValues(
        interaction.values,
        {
            day,
            role: 'night-pickup',
            discordIdOrEmail: discordId,
            period: 'always'
        }
    );
    dbg(`Adding ${addList.length} records`);
    await nightDataService.updateNightOpsForPersonAndDayAndSave(
        day,
        discordId,
        addList
    );
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

export async function VolunteerPickupDeleteButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-pickup-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    // todo: make sure we are only sending addList for this discordId and day?

    await nightDataService.updateNightOpsForPersonAndDayAndSave(
        day,
        discordId,
        []
    );
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

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

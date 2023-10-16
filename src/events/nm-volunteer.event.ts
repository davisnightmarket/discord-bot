import {
    type ButtonInteraction,
    StringSelectMenuInteraction,
    ChatInputCommandInteraction
} from 'discord.js';

import { type NmDayNameType, NmNightRoleType } from '../model';
import {
    GetVolunteerInitComponent,
    GetVolunteerListAllComponent,
    GetVolunteerPickupComponent,
    GetVolunteerRoleComponent
} from '../component/volunteer.component';
import {
    Dbg,
    GetChannelDayNameFromInteraction,
    GetChannelDayToday,
    type GuildServiceModel
} from '../utility';

const dbg = Dbg('VolunteerResponseEvent');
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

    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ||
        GetChannelDayToday();

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

        components: GetVolunteerInitComponent({ day, discordId })
    });
}

// when they hit the init button, the editing begins,
// same as a above when they have no commitments
export async function VolunteerInitButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day, role]: [string, NmDayNameType, NmNightRoleType, string]
) {
    if (command !== 'volunteer-init') {
        return;
    }

    dbg('volunteer-init', command);

    interaction.deferReply({ ephemeral: true });

    const { pickupList } = await nightDataService.getNightByDay(day);

    if (pickupList.length) {
        const components = GetVolunteerPickupComponent(
            {
                day,
                role,

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

    interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });

    return;
}

// here the user has chosen to pickup
export async function VolunteerEditDaySelectEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    [command, day, role, discordId]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        string
    ]
) {
    if (command !== 'volunteer-edit-day') {
        return;
    }

    dbg(command, day, role, discordId);

    interaction.deferReply({ ephemeral: true });

    const { pickupList } = await nightDataService.getNightByDay(day);

    const components = GetVolunteerRoleComponent({
        day,
        discordId
    });

    interaction.editReply({
        content: `OK, what would you like to do on ${day}?`,
        components
    });
}

// here the user has chosen to pickup
export async function VolunteerEditPickupSelectEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    [command, day, role, discordId]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        string
    ]
) {
    if (command !== 'volunteer-pickup') {
        return;
    }

    dbg(command, day, role, discordId);

    interaction.deferReply({ ephemeral: true });

    const { pickupList } = await nightDataService.getNightByDay(day);
    //     console.log('NIGHT PICKUP', pickupList);
    const components = GetVolunteerPickupComponent(
        {
            day,
            role,

            discordId
        },
        pickupList
    );

    interaction.editReply({
        content: 'OK, all set!',
        components
    });
}

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
export async function VolunteerRoleEditEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    [command, day, role, discordId]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        string
    ]
) {
    if (command !== 'volunteer-host') {
        return;
    }

    dbg(command, day, role, discordId);

    interaction.deferReply({ ephemeral: true });

    await nightDataService.addNightData([
        {
            day,
            org: '', // this should be Davis Night Market in Central Park
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
export async function VolunteerPickupOrgEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    [command, day, role, discordId]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        string
    ]
) {
    if (command !== 'volunteer-pickup-org') {
        return;
    }

    dbg(command, day, role, discordId);

    interaction.deferReply({ ephemeral: true });

    await nightDataService.addNightData([
        {
            day,
            org: '', // this should be Davis Night Market in Central Park
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

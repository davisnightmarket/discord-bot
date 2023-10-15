import {
    type ButtonInteraction,
    StringSelectMenuInteraction,
    ChatInputCommandInteraction
} from 'discord.js';

import {
    type NmDayNameType,
    type GuildServiceModel,
    NmNightRoleType
} from '../model';
import {
    GetVolunteerEditComponent,
    GetVolunteerPickupComponent,
    GetVolunteerRoleComponent
} from '../component/volunteer.component';
import {
    Dbg,
    GetChannelDayNameFromInteraction,
    GetChannelDayToday
} from '../utility';

const dbg = Dbg('VolunteerResponseEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
export async function VolunteerCommandEvent(
    { nightDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string,
    [command]: [string]
) {
    if (interaction.commandName !== 'volunteer') {
        return;
    }

    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ||
        GetChannelDayToday();

    const { pickupList, hostList } = await nightDataService.getNightByDay(day);
    pickupList.find((a) => a.personList.find((b) => b.discordId === discordId));
    // figure out their commitments, if any
    // if they have commitments, show them with a button
    if (
        pickupList.find((a) =>
            a.personList.find((b) => b.discordId === discordId)
        ) ||
        hostList.find((a) => a.discordId === discordId)
    ) {
        interaction.editReply({
            content: markdownService.md.VOLUNTEER_LIST({
                //todo turn these arrays into markdown
                pickupList: '',
                hostList: ''
            }),
            components: GetVolunteerEditComponent({ day, discordId })
        });
        return;
    }

    // otherwise, straight to the volunteering ...
    const content = markdownService.md.VOLUNTEER_EDIT_ROLE({
        roleDescription: '',
        roleName: '',
        hostList: ''
    });
    const components = GetVolunteerRoleComponent({ day, discordId });

    interaction.editReply({
        content,
        components
    });
}

// when they hit the edit button,  the editing begins, same as a above
export async function VolunteerInitButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,

    interaction: ButtonInteraction,
    discordId: string,
    [command]: [string]
) {
    if (command !== 'volunteer-init') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ||
        GetChannelDayToday();
    const { pickupList, hostList } = await nightDataService.getNightByDay(day);
    pickupList.find((a) => a.personList.find((b) => b.discordId === discordId));
    // figure out their commitments, if any
    // if they have commitments, show them with a button

    interaction.editReply({
        content: markdownService.md.VOLUNTEER_LIST({
            //todo turn these arrays into markdown
            pickupList: '',
            hostList: ''
        }),
        components: GetVolunteerRoleComponent({ day, discordId })
    });
    return;
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

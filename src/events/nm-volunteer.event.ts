import {
    type ButtonInteraction,
    Interaction,
    StringSelectMenuInteraction,
    ChatInputCommandInteraction
} from 'discord.js';

import {
    type NmDayNameType,
    type GuildServiceModel,
    NmNightRoleType,
    NmRolePeriodType
} from '../model';
import { DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';
import {
    GetVolunteerPeriodComponent,
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
// when a person issues a volunteer command ...
export async function VolunteerCommandEvent(
    { nightDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string,
    command: string
) {
    if (command !== 'volunteer') {
        return;
    }

    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ||
        GetChannelDayToday();

    const { pickupList } = await nightDataService.getNightByDay(day);

    const content = markdownService.md.VOLUNTEER_ONCE_OR_COMMIT({
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

// when a volunteer selects a role
export async function VolunteerEditRoleButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    [command, day, role, period]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ]
) {
    if (command !== 'volunteer-role') {
        return;
    }

    dbg(command, day, role, period);

    interaction.deferReply({ ephemeral: true });

    // there should always be a day
    if (!day || !DAYS_OF_WEEK_CODES.includes(day as NmDayNameType)) {
        interaction.editReply({
            content: await markdownService.getGenericSorry()
        });
        console.error('Passed not a day');
        return;
    }
    
    const { pickupList, hostList } = await nightDataService.getNightByDay(day);
    // role is selected in the first interaction
    if (!role) {
        interaction.editReply({
            content: await markdownService.getGenericSorry()
        });
        console.error('Passed not a role.');
        return;
    }

    if (!period) {
        const components = GetVolunteerPeriodComponent({ day, role });

        interaction.editReply({
            content: await markdownService.md.VOLUNTEER_ONCE_OR_COMMIT({
                roleName: NM_NIGHT_ROLES[role].name,
                roleDescription: NM_NIGHT_ROLES[role].description,
                hostList: hostList.map((a) => a.name).join(', ')
            }),
            components
        });

        return;
    }

    // the successful select is handled above by isStringSelectMenu
    if (role === 'night-pickup') {
        console.log('NIGHT PICKUP', pickupList);
        const components = GetVolunteerPickupComponent(
            {
                day,
                role,
                period
            },
            pickupList
        );
        // TODO: we can only select 25 at a time, so slice em up

        interaction.editReply({
            content: 'OK, all set!',
            components
        });

        return;
    }

    if (role === 'night-host') {
        // TODO: save to DB
        await nightDataService.addNightData([
            {
                day,
                org: '', // this should be Davis Night Market in Central Park
                role,
                discordIdOrEmail: interaction.user.id,
                period,
                // both of these should be got from core data
                timeStart: '2100',
                timeEnd: ''
            }
        ]);
        // succcess!
        interaction.editReply({
            content: 'OK, all set!'
        });

        return;
    }

    return;
}

export async function VolunteerEditInitButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: Interaction,
    args: string
) {
    const [command, day, role, period] = args.split('--') as [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ];

    dbg(command, day, role, period);

    if (command !== 'volunteer-init') {
        return;
    }

    (interaction as ButtonInteraction).deferReply({ ephemeral: true });

    // todo: replace all this with createMessageComponentCollector
    if (interaction.isButton()) {
        interaction = interaction as ButtonInteraction;
        // there should always be a day
        if (!day || !DAYS_OF_WEEK_CODES.includes(day as NmDayNameType)) {
            interaction.editReply({
                content: await markdownService.getGenericSorry()
            });
            console.error('Passed not a day');
            return;
        }
        const { pickupList, hostList } = await nightDataService.getNightByDay(
            day
        );
        // role is selected in the first interaction
        if (!role) {
            interaction.editReply({
                content: await markdownService.getGenericSorry()
            });
            console.error('Passed not a role.');
            return;
        }

        if (!period) {
            const components = GetVolunteerPeriodComponent({ day, role });

            interaction.editReply({
                content: await markdownService.md.VOLUNTEER_ONCE_OR_COMMIT({
                    roleName: NM_NIGHT_ROLES[role].name,
                    roleDescription: NM_NIGHT_ROLES[role].description,
                    hostList: hostList.map((a) => a.name).join(', ')
                }),
                components
            });

            return;
        }

        // the successful select is handled above by isStringSelectMenu
        if (role === 'night-pickup') {
            console.log('NIGHT PICKUP', pickupList);
            const components = GetVolunteerPickupComponent(
                {
                    day,
                    role,
                    period
                },
                pickupList
            );
            // TODO: we can only select 25 at a time, so slice em up

            interaction.editReply({
                content: 'OK, all set!',
                components
            });

            return;
        }

        if (role === 'night-host') {
            // TODO: save to DB
            await nightDataService.addNightData([
                {
                    day,
                    org: '', // this should be Davis Night Market in Central Park
                    role,
                    discordIdOrEmail: interaction.user.id,
                    period,
                    // both of these should be got from core data
                    timeStart: '2100',
                    timeEnd: ''
                }
            ]);
            // succcess!
            interaction.editReply({
                content: 'OK, all set!'
            });

            return;
        }

        return;
    }
}

export async function VolunteerEditPickupButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    args: string
) {
    const [command, day, role, period] = args.split('--') as [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ];

    if (command !== 'volunteer-period') {
        return;
    }

    dbg(command, day, role, period);

    interaction.deferReply({ ephemeral: true });
    // there should always be a day
    if (!day || !DAYS_OF_WEEK_CODES.includes(day as NmDayNameType)) {
        interaction.editReply({
            content: await markdownService.getGenericSorry()
        });
        console.error('Passed not a day');
        return;
    }
    const { pickupList, hostList } = await nightDataService.getNightByDay(day);
    // role is selected in the first interaction
    if (!role) {
        interaction.editReply({
            content: await markdownService.getGenericSorry()
        });
        console.error('Passed not a role.');
        return;
    }

    if (!period) {
        const components = GetVolunteerPeriodComponent({
            day,
            role,
            discordId
        });

        interaction.editReply({
            content: await markdownService.md.VOLUNTEER_ONCE_OR_COMMIT({
                roleName: NM_NIGHT_ROLES[role].name,
                roleDescription: NM_NIGHT_ROLES[role].description,
                hostList: hostList.map((a) => a.name).join(', ')
            }),
            components
        });

        return;
    }

    const components = GetVolunteerPickupComponent(
        {
            day,
            role,
            period,
            discordId
        },
        pickupList
    );
    // TODO: we can only select 25 at a time, so slice em up

    interaction.editReply({
        content: 'OK, all set!',
        components
    });

    return;
}

export async function VolunteerEditPickupSelectFinalEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    [command, day, role, period]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ]
) {
    if (command !== 'volunteer-pickup') {
        return;
    }

    dbg(command, day, role, period);

    interaction.deferReply({ ephemeral: true });

    // TODO: save to DB
    const [org, timeStart] = interaction.values[0].split('---');

    await nightDataService.addNightData([
        {
            day,
            org, // this should be Davis Night Market in Central Park
            role,
            discordIdOrEmail: interaction.user.id,
            period,

            timeStart,
            // both of these should be got from core data
            timeEnd: ''
        }
    ]);
    interaction.editReply({
        content: markdownService.md.GENERIC_OK({})
    });
}

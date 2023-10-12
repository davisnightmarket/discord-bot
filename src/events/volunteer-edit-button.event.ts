import { type ButtonInteraction, Interaction } from 'discord.js';

import {
    type NmDayNameType,
    type GuildServiceModel,
    NmNightRoleType,
    NmRolePeriodType
} from '../model';
import { DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';
import {
    GetVolunteerPeriodComponent,
    GetVolunteerPickupComponent
} from '../component/volunteer.component';
import { Dbg } from '../utility';

const dbg = Dbg('VolunteerResponseEvent');
// todo: split this into different events for clarity
// when a person requests a listing of
export async function VolunteerEditButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: Interaction,
    args: string
) {
    (interaction as ButtonInteraction).deferReply();
    const [command, day, role, period] = args.split('--') as [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ];

    dbg(command, day, role, period);

    if (command !== 'volunteer') {
        return;
    }

    // in this case we are selecting the day (or days) for volunteering, which is the final step
    if (interaction.isStringSelectMenu()) {
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
                    hostNames: hostList.map((a) => a.name).join(', ')
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

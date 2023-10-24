import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import {
    AvailabilityEditButtonComponent,
    AvailabilityToPickupDaySelectComponent
} from '../component';
import { type GuildServiceModel, Dbg } from '../utility';

import { StringSelectMenuInteraction } from 'discord.js';
import { NmDayNameType, NmNightRoleType } from '../model';
import {
    AvailabilityToHostComponent,
    AvailabilityToPickupPerDaySelectComponent
} from '../component';
import { DAYS_OF_WEEK } from '../const';
// in which user edits their availability

const dbg = Dbg('AvailabilityEvent');

export async function AvailabilityCommandEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    dbg('ok');

    await interaction.deferReply({ ephemeral: true });

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    if (!person) {
        // show them their modal
        await interaction.editReply(await markdownService.getGenericSorry());
        return;
    }

    const [availabilityHostList, availabilityPickupList] =
        markdownService.getAvailabilityListsFromPerson(person);

    const components = AvailabilityEditButtonComponent(discordId);

    const content =
        [
            markdownService.md.AVAILABILITY_LIST({
                availabilityHostList,
                availabilityPickupList
            })
        ].join('\n') + '\n';

    await interaction.editReply({
        content,
        components
    });
}

// triggered by any button event with an availability custom id

export async function AvailabilityEditButtonEvent(
    { personDataService, nightDataService, markdownService }: GuildServiceModel,

    interaction: ButtonInteraction,
    discordId: string,
    [command, step, day]: [
        string,
        (
            | NmNightRoleType
            | 'init-host'
            | 'init-pickup'
            | 'night-distro-clear'
            | 'night-pickup-clear'
        ),
        NmDayNameType
    ]
) {
    // todo: handle this higher up
    if (command !== 'availability') {
        return;
    }

    dbg(command, step, day);
    await interaction.deferReply({ ephemeral: true });

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    if (!person) {
        //! we would like to show them their modal
        // // we cannot show the identity model since we have deferred
        await interaction.editReply(await markdownService.getGenericNoPerson());

        return;
    }

    // they have clicked the button and want to edit pickup avail
    if (step === 'init-pickup') {
        // this component is a list of days
        // they choose a day, then edit the pickup availability for that day
        // because showing every day pickup iss too much interface - we have option limits
        const components = AvailabilityToPickupDaySelectComponent({
            discordId
        });

        await interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP({}),
            components
        });
    }

    // they ave clicked the button indicating they want to edit host avail
    if (step === 'init-host') {
        const dayTimes =
            await nightDataService.getDayTimeIdAndReadableByDayAsTupleList({
                includeRoleList: ['night-captain']
            });
        console.log(dayTimes);
        const components = AvailabilityToHostComponent(dayTimes, discordId, []);
        // todo: show host then pickup, since we can't fit them all

        await interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_HOST({}),
            components
        });
    }

    const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

    // in this case we have selected our night-distro availability so ...
    if (step === 'night-distro-clear') {
        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityHost: ''
        });

        await interaction.editReply({
            content: markdownService.md.GENERIC_OK({})
        });
        return;
    }

    // in this case we are in the pickup section
    if (step === 'night-pickup-clear') {
        // save the previous to the db ...
        // if we are on the first day, reset
        let { availabilityPickup } = person;

        availabilityPickup = '';

        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityPickup
        });

        // response
        await interaction.editReply({
            content: markdownService.md.GENERIC_OK({})
        });
    }
}

// triggered by any select event with an availability custom id
export async function AvailabilityEditSelectEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, step, day]: [
        string,
        NmNightRoleType | 'night-pickup-day',
        NmDayNameType
    ]
) {
    // todo: handle this higher up
    if (command !== 'availability') {
        return;
    }

    dbg(command, step, day);
    await interaction.deferReply({ ephemeral: true });

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    if (!person) {
        //! we would like to show them their modal
        // // we cannot show the identity model since we have deferred
        await interaction.editReply(await markdownService.getGenericNoPerson());
        // interaction.showModal(
        //     IdentityEditModalComponent(personDataService.createPerson(person))
        // );
        return;
    }

    const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

    // in this case we have selected our night-distro availability so ...
    if (step === 'night-distro') {
        // save it to the db ...
        // const [day, timeStart] = interaction.values[0].split('|||');
        // dbg(day, timeStart);

        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityHost: interaction.values.join(',')
        });

        await interaction.editReply({
            content: markdownService.md.GENERIC_OK({})
        });
        return;
    }

    // in this case we are in the pickup section
    if (step === 'night-pickup-day') {
        // save the previous to the db ...
        // if we are on the first day, reset

        const selectedDayId = interaction.values[0] as NmDayNameType;

        const selectedDay = DAYS_OF_WEEK[selectedDayId];
        // todo: show host then pickup, since we can't fit them all
        const components = AvailabilityToPickupPerDaySelectComponent({
            day: selectedDay.id,
            discordId,
            defaultList: []
        });

        // response
        await interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP_ON_DAY({
                dayName: selectedDay.name
            }),

            components
        });
    }
    // in this case we are in the pickup section
    if (step === 'night-pickup') {
        // save the previous to the db ...
        // if we are on the first day, reset
        let { availabilityPickup } = person;
        if (!daysOfWeekIdList.indexOf(day)) {
            availabilityPickup = interaction.values.join(',');
        } else {
            availabilityPickup += interaction.values.join(',');
        }
        // make sure they are unique
        availabilityPickup = availabilityPickup
            .split(', ')
            .reduce<string[]>((a, b) => {
                if (!a.includes(b)) {
                    a.push(b);
                }
                return a;
            }, [])
            .join(',');

        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityPickup
        });

        // // show the next step
        // const nextDayIndex = daysOfWeekIdList.indexOf(day) + 1;
        // // in this case we are done with the pickups, want to show permissions
        // if (nextDayIndex === daysOfWeekIdList.length) {
        //     await interaction.editReply({
        //         content: markdownService.md.GENERIC_OK({})
        //     });
        //     return;
        // }

        // const currentDay = Object.values(DAYS_OF_WEEK)[nextDayIndex];
        // // todo: show host then pickup, since we can't fit them all
        // const components = AvailabilityToPickupPerDaySelectComponent({
        //     day: currentDay.id,
        //     discordId,
        //     defaultList: []
        // });

        // response
        await interaction.editReply({
            content: markdownService.md.GENERIC_OK({})

            //components
        });
    }
}

// // in which user edits their availability
// export async function AvailabilityNoneButtonEvent(
//     { personDataService, markdownService }: GuildServiceModel,

//     interaction: ButtonInteraction,
//     discordId: string,
//     [command, step, day]: [
//         string,
//         NmNightRoleType | 'night-distro' | 'night-pickup',
//         NmDayNameType
//     ]
// ) {
//     // todo: handle this higher up
//     if (command !== 'availability-none') {
//         return;
//     }

//     dbg(command, step, day);
//     await interaction.deferReply({ ephemeral: true });

//     // get the person's data
//     const person = await personDataService.getPersonByDiscordId(
//         interaction.user.id
//     );

//     if (!person) {
//         //! we would like to show them their modal
//         // // we cannot show the identity model since we have deferred
//         await interaction.editReply(await markdownService.getGenericNoPerson());
//         // interaction.showModal(
//         //     IdentityEditModalComponent(personDataService.createPerson(person))
//         // );
//         return;
//     }

//     const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

//     // in this case we have selected our night-distro availability so ...
//     if (step === 'night-distro') {
//         // save it to the db ...
//         // const [day, timeStart] = interaction.values[0].split('|||');
//         // dbg(day, timeStart);

//         personDataService.updatePersonByDiscordId({
//             ...person,
//             availabilityHost: ''
//         });

//         // now display first night-pickup select
//         const currentDay = DAYS_OF_WEEK[daysOfWeekIdList[0]];
//         const components = AvailabilityToPickupPerDayComponent({
//             day: currentDay.id,
//             discordId,
//             defaultList: []
//         });

//         await interaction.editReply({
//             content: markdownService.md.AVAILABILITY_TO_PICKUP({
//                 dayName: currentDay.name
//             }),

//             components
//         });
//         return;
//     }

//     // in this case we are in the pickup section
//     if (step === 'night-pickup') {
//         // save the previous to the db ...
//         // if we are on the first day, reset
//         let { availabilityPickup } = person;
//         if (!daysOfWeekIdList.indexOf(day)) {
//             availabilityPickup = '';
//         } else {
//             availabilityPickup += '';
//         }
//         personDataService.updatePersonByDiscordId({
//             ...person,
//             availabilityPickup
//         });

//         // show the next step
//         const nextDayIndex = daysOfWeekIdList.indexOf(day) + 1;
//         // in this case we are done with the pickups, want to show permissions
//         if (nextDayIndex === daysOfWeekIdList.length) {
//             await interaction.editReply({
//                 content: markdownService.md.GENERIC_OK({})
//             });
//             return;
//         }

//         const currentDay = Object.values(DAYS_OF_WEEK)[nextDayIndex];
//         // todo: show host then pickup, since we can't fit them all
//         const components = AvailabilityToPickupPerDayComponent({
//             day: currentDay.id,
//             discordId,
//             defaultList: []
//         });

//         // response
//         await interaction.editReply({
//             content: markdownService.md.AVAILABILITY_TO_PICKUP({
//                 dayName: currentDay.name
//             }),

//             components
//         });
//     }
// }

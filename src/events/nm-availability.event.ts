import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import {
    AvailabilityEditButtonComponent,
    IdentityEditModalComponent
} from '../component';
import { type GuildServiceModel, Dbg } from '../utility';

import { StringSelectMenuInteraction } from 'discord.js';
import { NmDayNameType, NmNightRoleType } from '../model';
import {
    AvailabilityToHostComponent,
    AvailabilityToPickupPerDayComponent
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
        interaction.editReply(await markdownService.getGenericSorry());
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

    interaction.editReply({
        content,
        components
    });
}

// in which user edits their availability
export async function AvailabilityEditButtonEvent(
    { personDataService, nightDataService, markdownService }: GuildServiceModel,

    interaction: ButtonInteraction,
    discordId: string,
    [command, step, day]: [string, NmNightRoleType | 'init', NmDayNameType]
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
        interaction.editReply(await markdownService.getGenericNoPerson());
        // interaction.showModal(
        //     IdentityEditModalComponent(personDataService.createPerson(person))
        // );
        return;
    }

    if (step === 'init') {
        // if (!person) {
        //     // show them their modal
        //     interaction.showModal(
        //         IdentityEditModalComponent(
        //             personDataService.createPerson(person)
        //         )
        //     );
        //     return;
        // }

        const dayTimes =
            await nightDataService.getDayTimeIdAndReadableByDayAsTupleList();

        // todo: show host then pickup, since we can't fit them all
        const components = AvailabilityToHostComponent(dayTimes, discordId, []);
        // response
        interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_HOST({}),
            components
        });
    }
}

// in which user edits their availability
export async function AvailabilityEditSelectEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, step, day]: [string, NmNightRoleType | 'init', NmDayNameType]
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
        interaction.editReply(await markdownService.getGenericNoPerson());
        // interaction.showModal(
        //     IdentityEditModalComponent(personDataService.createPerson(person))
        // );
        return;
    }

    const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

    // in this case we have selected our night-host availability so ...
    if (step === 'night-host') {
        // save it to the db ...
        // const [day, timeStart] = interaction.values[0].split('|||');
        // dbg(day, timeStart);

        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityHost: interaction.values.join(',')
        });

        // now display first night-pickup select
        const currentDay = DAYS_OF_WEEK[daysOfWeekIdList[0]];
        const components = AvailabilityToPickupPerDayComponent({
            day: currentDay.id,
            discordId,
            defaultList: []
        });

        interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),

            components
        });
        return;
    }

    // in this case we are in the pickup section
    if (step === 'night-pickup') {
        // save the previous to the db ...
        // if we are on the first day, reset
        let availabilityPickup: string = '';
        if (!daysOfWeekIdList.indexOf(day)) {
            availabilityPickup = interaction.values.join(',');
        } else {
            availabilityPickup += interaction.values.join(',');
        }
        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityPickup
        });

        // show the next step
        const nextDayIndex = daysOfWeekIdList.indexOf(day) + 1;
        // in this case we are done with the pickups, want to show permissions
        if (nextDayIndex === daysOfWeekIdList.length) {
            interaction.editReply({
                content: markdownService.md.GENERIC_OK({})
            });
            return;
        }

        const currentDay = Object.values(DAYS_OF_WEEK)[nextDayIndex];
        // todo: show host then pickup, since we can't fit them all
        const components = AvailabilityToPickupPerDayComponent({
            day: currentDay.id,
            discordId,
            defaultList: []
        });

        // response
        interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),

            components
        });
    }
}

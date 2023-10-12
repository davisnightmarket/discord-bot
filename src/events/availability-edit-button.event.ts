import { StringSelectMenuInteraction } from 'discord.js';
import { GuildServiceModel, NmDayNameType, NmNightRoleType } from '../model';
import {
    AvailabilityToHostComponent,
    AvailabilityToPickupPerDayComponent,
    IdentityEditModalComponent,
    PermissionStartComponent
} from '../component';
import { DAYS_OF_WEEK } from '../const';
import { Dbg } from '../utility';

// in which user edits their availability

const dbg = Dbg('AvailabilityEditButtonEvent');
export async function AvailabilityEditButtonEvent(
    { personDataService, nightDataService, markdownService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    args: string
) {
    const [command, step, day] = args.split('--') as [
        string,
        NmNightRoleType | 'night-list',
        NmDayNameType
    ];

    dbg(command, step, day);

    // todo: handle this higher up
    if (command !== 'availability') {
        return;
    }

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );
    if (!person) {
        //! we would like to show them their modal
        // // we cannot show the identity model since we have deferred
        // interaction.editReply({
        //     content: await markdownService.getGenericNoPerson()
        // });
        interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
        return;
    }
    await interaction.deferReply();

    if (step === 'night-list') {
        if (!person) {
            // show them their modal
            interaction.showModal(
                IdentityEditModalComponent(
                    personDataService.createPerson(person)
                )
            );
            return;
        }

        const dayTimes =
            await nightDataService.getDayTimeIdAndReadableByDayAsTupleList();

        // todo: show host then pickup, since we can't fit them all
        const components = AvailabilityToHostComponent(
            dayTimes,
            personDataService.createPerson(person)
        );
        // response
        interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_HOST({}),
            components
        });
    }

    const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

    // todo: we probably should have a routing utility for routing different types of responses
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
            day: currentDay.id
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
            // todo get these and build them
            const contactTextOnList = '',
                contactEmailOnList = '',
                sharePhoneOnList = '',
                shareEmailOnList = '';
            interaction.editReply({
                content: markdownService.md.PERMISSION_LIST({
                    contactTextOnList,
                    contactEmailOnList,
                    sharePhoneOnList,
                    shareEmailOnList
                }),
                components: PermissionStartComponent()
            });
            return;
        }

        const currentDay = Object.values(DAYS_OF_WEEK)[nextDayIndex];
        // todo: show host then pickup, since we can't fit them all
        const components = AvailabilityToPickupPerDayComponent({
            day: currentDay.id
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

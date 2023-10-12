import { StringSelectMenuInteraction } from 'discord.js';
import { GuildServiceModel, NmDayNameType, NmNightRoleType } from '../model';
import {
    AvailabilityToHostComponent,
    AvailabilityToPickupPerDayComponent,
    IdentityEditModalComponent
} from '../component';
import { DAYS_OF_WEEK } from '../const';
import { Dbg } from '../utility';
import { ParseContentService } from '../service';

// in which user edits their availability

const dbg = Dbg('AvailabilityEditEvent');
export async function AvailabilitySelectEvent(
    { personDataService, nightDataService, messageService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction
) {
    dbg('ok');

    const [command, period, day] =
        (interaction.customId?.split('--') as [
            string,
            NmNightRoleType | 'night-list',
            NmDayNameType
        ]) || [];
    dbg(command, period, day);

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
        //     content: await messageService.getGenericNoPerson()
        // });
        interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
        return;
    }
    await interaction.deferReply();

    if (period === 'night-list') {
        if (!person) {
            // show them their modal
            interaction.showModal(
                IdentityEditModalComponent(
                    personDataService.createPerson(person)
                )
            );
            return;
        }

        const dayTimes = await nightDataService.waitingForNightCache.then(
            (nightOps) => {
                const dayTimesMap = nightOps.reduce<{
                    [k in string]: [string, string];
                }>((a, b) => {
                    if (b.day && b.timeStart && !a[b.day + b.timeStart]) {
                        a[b.day + b.timeStart] = [
                            `${b.day}|||${b.timeStart}`,
                            `${
                                DAYS_OF_WEEK[b.day].name
                            } ${ParseContentService.getAmPmTimeFrom24Hour(
                                b.timeStart
                            )}`
                        ];
                    }
                    return a;
                }, {});
                return Object.values(dayTimesMap);
            }
        );
        // todo: show host then pickup, since we can't fit them all
        const components = AvailabilityToHostComponent(
            dayTimes,
            personDataService.createPerson(person)
        );
        // response
        interaction.editReply({
            content: messageService.m.AVAILABILITY_TO_HOST({}),
            components
        });
    }

    const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

    // todo: we probably should have a routing utility for routing different types of responses
    // in this case we have selected our night-host availability so ...
    if (period === 'night-host') {
        // save it to the db ...
        const [day, timeStart] = interaction.values[0].split('|||');
        dbg(day, timeStart);
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
            content: messageService.m.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),

            components
        });
        return;
    }
    // in this case we are in the pickup section
    if (period === 'night-pickup') {
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
        // present night-pickup selects
        if (nextDayIndex === daysOfWeekIdList.length) {
            interaction.editReply({
                content: messageService.m.GENERIC_OK({})
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
            content: messageService.m.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),

            components
        });
    }
}

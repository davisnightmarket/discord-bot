import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { GuildServiceModel, NmDayNameType, NmNightRoleType } from '../model';
import { AvailabilityToPickupPerDayComponent } from '../component';
import { DAYS_OF_WEEK } from '../const';
import { Dbg } from '../utility';

// in which user edits their availability

const dbg = Dbg('AvailabilityEditEvent');
export async function AvailabilitySelectEvent(
    { personDataService, messageService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction
) {
    dbg('ok');

    const [command, period, day] =
        (interaction.customId?.split('--') as [
            string,
            NmNightRoleType,
            NmDayNameType
        ]) || [];
    if (command !== 'availability') {
        return;
    }
    await interaction.deferReply();

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );
    if (!person) {
        // show them their modal
        // we cannot show the identity model since we have deferred
        interaction.editReply({
            content: await messageService.getGenericNoPerson()
        });
        return;
    }

    const daysOfWeekIdList = Object.values(DAYS_OF_WEEK).map((a) => a.id);

    // todo: we probably should have a routing utility for routing different types of responses
    // in this case we have selected our night-host availability so ...
    if (period === 'night-host') {
        // save it to the db ...
        const [day, timeStart] = interaction.values[0].split('|||');
        dbg(day, timeStart);
        // TODO: edit person spread to allow for this value
        //person.availabilityToHost = interaction.values.join(',');
        // personDataService.updatePersonByDiscordId({
        //     ...person,
        //     availabilityToHost:interaction.values.join(',')
        // })

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
        // TODO: edit person spread to allow for this value
        // person.availabilityToPickup = interaction.values.join(',');
        // personDataService.updatePersonByDiscordId({
        //     ...person,
        //     availabilityToPickup:interaction.values.join(',')
        // })

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

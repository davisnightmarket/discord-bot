import { ChatInputCommandInteraction } from 'discord.js';
import {
    GuildServiceModel,
    NmDayNameType,
    NmPartOfDayNameType
} from '../model';
import {
    AvailabilityEditButtonComponent,
    IdentityEditModalComponent
} from '../component';
import { Dbg } from '../utility';
import { DAYS_OF_WEEK, PARTS_OF_DAY } from '../const';
import { ParseContentService } from '../service';

// in which user edits their availability

const dbg = Dbg('AvailabilityCommandEvent');
export async function AvailabilityCommandEvent(
    { personDataService, nightDataService, messageService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    dbg('ok');
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    if (!person) {
        // show them their modal
        interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
        return;
    }

    // todo: mover to person service
    const availabilityHostList = person.availabilityHost
        .split(',')
        .map((a) =>
            a
                .trim()
                .split('|||')
                .map((a) => a.trim())
        )
        .map(
            (a) =>
                `${
                    DAYS_OF_WEEK[a[0] as NmDayNameType].name
                } ${ParseContentService.getAmPmTimeFrom24Hour(a[1])}`
        );
    const availabilityPickupList = person.availabilityPickup
        .split(',')
        .map((a) =>
            a
                .trim()
                .split('|||')
                .map((a) => a.trim())
        )
        .map(
            (a) =>
                `${DAYS_OF_WEEK[a[0] as NmDayNameType].name} ${
                    PARTS_OF_DAY[a[1] as NmPartOfDayNameType].name
                }`
        );

    console.log(
        person.availabilityHost.split(',').map((a) =>
            a
                .trim()
                .split('|||')
                .map((a) => a.trim())
        )
    );
    console.log(
        person.availabilityPickup.split(',').map((a) =>
            a
                .trim()
                .split('|||')
                .map((a) => a.trim())
        )
    );
    await interaction.deferReply();

    // todo: show host then pickup, since we can't fit them all
    const components = AvailabilityEditButtonComponent();
    const content = messageService.m.AVAILABILITY_LIST({
        availabilityHostList,
        availabilityPickupList
    });
    // response
    interaction.editReply({
        content,
        components
    });
}

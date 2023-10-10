import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import {
    AvailabilityHostComponent,
    IdentityEditModalComponent
} from '../component';

// in which user edits their availability

export async function IdentityEditAvailabilityEvent(
    { personDataService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );
    console.log(person, 'PERS', interaction.user.id);

    if (!person) {
        // show them their modal
        interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
        return;
    }

    // todo: show host then pickup, since we can't fit them all
    const components = AvailabilityHostComponent(
        personDataService.createPerson(person)
    );

    // response
    interaction.reply({
        content:
            'Which days and times are you available to host and/or pickup and deliver to Night Market?\n You can select multiple days and times.',
        components
    });
}

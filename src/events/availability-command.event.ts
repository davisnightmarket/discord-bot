import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import {
    AvailabilityEditButtonComponent,
    IdentityEditModalComponent
} from '../component';
import { Dbg } from '../utility';

// in which user edits their availability

const dbg = Dbg('AvailabilityCommandEvent');
export async function AvailabilityCommandEvent(
    { personDataService, markdownService }: GuildServiceModel,

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

    await interaction.deferReply();

    const [availabilityHostList, availabilityPickupList] =
        markdownService.getAvailabilityListsFromPerson(person);

    const components = AvailabilityEditButtonComponent();

    const content = markdownService.md.AVAILABILITY_LIST({
        availabilityHostList,
        availabilityPickupList
    });
    // response
    interaction.editReply({
        content,
        components
    });
}

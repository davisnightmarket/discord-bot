import { Interaction, ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import { IdentityEditModalComponent } from '../component';

export async function IdentityEditEvent(
    { personDataService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    if (!interaction.guild) {
        (interaction as ChatInputCommandInteraction).reply(
            'Hi, you can only do that on the server!'
        );
        return;
    }

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    // show them their modal
    interaction.showModal(
        IdentityEditModalComponent(personDataService.createPerson(person))
    );
}

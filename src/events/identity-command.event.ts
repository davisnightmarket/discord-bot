import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import { IdentityEditModalComponent } from '../component';
import { Dbg } from '../utility';

const dbg = Dbg('IdentityEditEvent');

export async function IdentityCommandEvent(
    { personDataService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    dbg('ok');

    if (!interaction.guild) {
        (interaction as ChatInputCommandInteraction).reply(
            'Hi, you can only do that on the server!'
        );
        return;
    }

    // ! for some reason this is taking too long sometimes. Why? It is cached data
    // i think this is because when the cache is reloading, the reply has to wait for more
    // than three seconds, which discord doesn't allow. We will have to live with this.
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    //show them their modal
    try {
        await interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
    } catch (e) {
        console.error(e);
    }
}

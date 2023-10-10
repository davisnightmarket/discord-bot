import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import { IdentityEditModalComponent } from '../component';
import { Dbg } from '../utility';

const dbg = Dbg('IdentityEditEvent');

export async function IdentityEditEvent(
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

    // ! for some reason this is taking too long. Why? It is cached data at times
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

    // interaction.showModal(
    //     IdentityEditModalComponent(personDataService.createPerson({}))
    // );
}

import {
    Interaction,
    ChatInputCommandInteraction,
    ModalSubmitInteraction
} from 'discord.js';
import { GuildServiceModel } from '../model';
import { PersonModel } from '../service';
import { Dbg } from '../utility';

const dbg = Dbg('IdentityEditEvent');

export async function IdentitySubmitEvent(
    { personDataService }: GuildServiceModel,

    interaction: ModalSubmitInteraction
) {
    if (interaction.customId !== 'identity') {
        return;
    }
    dbg('ok');

    interaction.deferReply({
        ephemeral: true
    });

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    if (!person) {
        interaction.editReply({
            content: 'Sorry, we cannot find that!'
        });
        return;
    }
    // for (const k of Object.keys(person as PersonModel)) {
    //     const value = interaction.fields.getTextInputValue(k).trim();
    //     if (value) {
    //         person[k] = value;
    //     }
    // }
    const name = interaction.fields.getTextInputValue('identity--name').trim();

    console.log(name);
    await personDataService.updatePersonByDiscordId({
        ...person,
        name
    });

    interaction.editReply({
        content: 'OK, all set!'
    });
}

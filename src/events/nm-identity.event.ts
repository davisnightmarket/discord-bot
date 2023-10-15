import { GuildServiceModel } from '../model';
import { IdentityEditModalComponent } from '../component';
import {
    ChatInputCommandInteraction,
    ModalSubmitInteraction
} from 'discord.js';
import { Dbg } from '../utility';

const dbg = Dbg('IdentityEvent');

export async function IdentityCommandEvent(
    { personDataService }: GuildServiceModel,
    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    if (interaction.commandName !== 'identity') {
        return;
    }
    dbg('IdentityCommandEvent');

    // ! for some reason this is taking too long sometimes. Why? It is cached data
    // i think this is because when the cache is reloading, the reply has to wait for more
    // than three seconds, which discord doesn't allow. We will have to live with this.
    const person = await personDataService.getPersonByDiscordId(discordId);

    //show them their modal
    try {
        await interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
    } catch (e) {
        console.error(e);
    }
}

export async function IdentityEditModalEvent(
    { personDataService }: GuildServiceModel,

    interaction: ModalSubmitInteraction,
    discordId: string
) {
    if (interaction.customId !== 'identity-edit') {
        return;
    }
    dbg('IdentityEditModalEvent');

    interaction.deferReply({
        ephemeral: true
    });

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(discordId);

    if (!person) {
        interaction.editReply({
            content: 'Sorry, we cannot find that!'
        });
        return;
    }

    for (const k of Object.keys(person)) {
        let value: string = '';
        try {
            value = interaction.fields.getTextInputValue(k).trim();
        } catch (e: any) {
            console.log(e.message);
        }

        if (value) {
            person[k] = value;
        }
    }

    await personDataService.updatePersonByDiscordId({
        ...person
    });

    interaction.editReply({
        content: 'OK, all set!'
    });
}

import { IdentityEditModalComponent } from '../component';
import {
    type ChatInputCommandInteraction,
    type ModalSubmitInteraction
} from 'discord.js';
import { type GuildServiceModel, Dbg } from '../utility';
import { PersonDataService } from '../service';

const dbg = Dbg('IdentityEvent');

export async function IdentityCommandEvent(
    { personDataService }: GuildServiceModel,
    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    dbg('IdentityCommandEvent');

    // ! for some reason this is taking too long sometimes. Why? It is cached data
    // i think this is because when the cache is reloading, the reply has to wait for more
    // than three seconds, which discord doesn't allow. We will have to live with this.
    const person = await personDataService.getPersonByDiscordId(discordId);

    // show them their modal
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
    discordId: string,
    [command]: [string]
) {
    if (command !== 'identity-edit') {
        return;
    }
    dbg('IdentityEditModalEvent');

    interaction.deferReply({
        ephemeral: true
    });

    // get the person's data
    // or create a blank person
    const person =
        (await personDataService.getPersonByDiscordId(discordId)) ??
        PersonDataService.createPerson({
            discordId
        });

    if (!person.email) {
        dbg(`Creating new person record ${person.email}`);
    } else {
        dbg(`Updating person record ${person.email}`);
    }

    for (const k of Object.keys(person)) {
        let value: string = '';
        try {
            value = interaction.fields.getTextInputValue(k).trim();
        } catch (e: any) {
            console.error(e.message);
        }

        if (value) {
            person[k] = value;
        }
    }

    await personDataService.createOrUpdatePersonByDiscordId({
        ...person
    });

    await interaction.editReply({
        content: 'OK, all set!'
    });
}

import {
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { PersonModel } from '../service';
import { Dbg } from '../utility';

// a button for deleting all identifying info frrom our db
export const IdentityDeleteComponent = () => {
    const deleteButton = new ButtonBuilder()
        .setCustomId('identity--delete')

        .setLabel('DELETE!!!')
        // Paragraph means multiple lines of text.
        .setStyle(ButtonStyle.Danger);
    return {
        content: 'Delete your Night Market identity? This cannot be undone.',
        components: [new ActionRowBuilder().addComponents(deleteButton)]
    };
};

const dbg = Dbg('identity.component');
export const IdentityEditModalComponent = ({
    discordId,
    name,
    bio,
    phone,
    email
}: PersonModel) => {
    dbg(discordId, name, bio, phone, email);

    const modal = new ModalBuilder()
        .setCustomId(`identity`)
        .setTitle('Night Market Identity Edit');

    const nameInput = new TextInputBuilder()
        .setCustomId(`identity--name`)
        .setLabel('What is your lived name?')
        .setValue(name)
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

    const bioInput = new TextInputBuilder()
        .setCustomId(`identity--bio`)
        .setLabel('Please tell us something biographical!')
        .setValue(bio)
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

    const emailInput = new TextInputBuilder()
        .setCustomId(`identity--email`)
        .setLabel('Your email address:')

        .setValue(email)
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

    const phoneInput = new TextInputBuilder()
        .setCustomId(`identity--phone`)
        .setLabel('Your phone number:')
        .setValue(phone)
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);
    // Add inputs to the modal
    modal
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput)
        )
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(bioInput)
        )
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
        )
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(phoneInput)
        );

    return modal;
};

// export const IdentityEditComponent = ({
//     discordId,
//     name,
//     bio,
//     phone,
//     email
// }: PersonModel) => {
//     const phoneInput = new TextInputBuilder()
//         .setCustomId(`identity--phone`)
//         .setLabel('Your phone number:')
//         .setValue(phone)
//         // Paragraph means multiple lines of text.
//         .setStyle(TextInputStyle.Short);

//     return [
//         new ActionRowBuilder().addComponents(phoneInput),
//         new ActionRowBuilder().addComponents(phoneInput)
//     ];
// };

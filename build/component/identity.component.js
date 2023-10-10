"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditComponent = exports.IdentityEditModalComponent = exports.IdentityDeleteComponent = void 0;
const discord_js_1 = require("discord.js");
// a button for deleting all identifying info frrom our db
const IdentityDeleteComponent = () => {
    const deleteButton = new discord_js_1.ButtonBuilder()
        .setCustomId('identity--delete')
        .setLabel('DELETE!!!')
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.ButtonStyle.Danger);
    return {
        content: 'Delete your Night Market identity? This cannot be undone.',
        components: [new discord_js_1.ActionRowBuilder().addComponents(deleteButton)]
    };
};
exports.IdentityDeleteComponent = IdentityDeleteComponent;
const IdentityEditModalComponent = ({ discordId, name, bio, phone, email }) => {
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`identity--${discordId}`)
        .setTitle('Night Market Identity Edit');
    const nameInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`identity--${discordId}--name`)
        .setLabel('What is your lived name?')
        .setPlaceholder(name)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    const bioInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`identity--${discordId}--bio`)
        .setLabel('Please tell us something biographical!')
        .setPlaceholder(bio)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Paragraph);
    const emailInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`identity--${discordId}--email`)
        .setLabel('Your email address:')
        .setPlaceholder(email)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    const phoneInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`identity--${discordId}--phone`)
        .setLabel('Your phone number:')
        .setPlaceholder(phone)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    // Add inputs to the modal
    modal
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(nameInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(bioInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(emailInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(phoneInput));
    return modal;
};
exports.IdentityEditModalComponent = IdentityEditModalComponent;
const IdentityEditComponent = ({ discordId, name, bio, phone, email }) => {
    const phoneInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`identity--${discordId}--phone`)
        .setLabel('Your phone number:')
        .setPlaceholder(phone)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    return [
        new discord_js_1.ActionRowBuilder().addComponents(phoneInput),
        new discord_js_1.ActionRowBuilder().addComponents(phoneInput)
    ];
};
exports.IdentityEditComponent = IdentityEditComponent;

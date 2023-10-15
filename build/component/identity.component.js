"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditModalComponent = exports.IdentityDeleteComponent = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
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
const dbg = (0, utility_1.Dbg)('identity.component');
const IdentityEditModalComponent = ({ discordId, name, bio, phone, email, pronouns }) => {
    dbg(discordId, name, bio, phone, email, pronouns);
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`identity-edit--${discordId}`)
        .setTitle('Night Market Identity Edit');
    const nameInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`name`)
        .setLabel('What is your lived name?')
        .setValue(name)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    const pronounsInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`pronouns`)
        .setLabel('Your pronouns:')
        .setValue(pronouns)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    const bioInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`bio`)
        .setLabel('Please tell us something biographical!')
        .setValue(bio)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Paragraph);
    const emailInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`email`)
        .setLabel('Your email address:')
        .setValue(email)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    const phoneInput = new discord_js_1.TextInputBuilder()
        .setCustomId(`phone`)
        .setLabel('Your phone number:')
        .setValue(phone)
        // Paragraph means multiple lines of text.
        .setStyle(discord_js_1.TextInputStyle.Short);
    // Add inputs to the modal
    modal
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(nameInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(pronounsInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(bioInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(emailInput))
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(phoneInput));
    return modal;
};
exports.IdentityEditModalComponent = IdentityEditModalComponent;

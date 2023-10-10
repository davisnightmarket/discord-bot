"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = new discord_js_1.SlashCommandBuilder()
    .setName('nm')
    .setDescription('Do stuff with Night Market!')
    .addStringOption((option) => option
    .setName('command')
    .setDescription('different commands do different things')
    .setRequired(true)
    .addChoices({
    name: 'Volunteer to Host',
    value: 'volunteer-pickup'
}, {
    name: 'Volunteer to Pickup',
    value: 'volunteer-host'
}, {
    name: 'Edit Availability',
    value: 'edit-availability'
}, {
    name: 'Edit Identity',
    value: 'edit-identity'
}));

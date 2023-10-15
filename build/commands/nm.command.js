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
    name: 'Volunteer To Help',
    value: 'volunteer'
}, {
    name: 'Set Availability',
    value: 'availability'
}, {
    name: 'Grant Permissions',
    value: 'permission'
}, {
    name: 'Edit Identity & Contact Info',
    value: 'identity'
}, {
    name: 'Help & Docs',
    value: 'help-and-docs'
}));

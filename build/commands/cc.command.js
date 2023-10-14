"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = new discord_js_1.SlashCommandBuilder()
    .setName('cc')
    .setDescription('Do stuff with Night Market!')
    .addStringOption((option) => option.setName('command').setDescription('Edit Users').addChoices({
    name: 'Add or Remove Volunteer Role',
    value: 'volunteer'
}, {
    name: 'Add or Remove Permissions',
    value: 'set-permissons'
}, {
    name: 'Add or Remove Availability',
    value: 'set-availability'
}, {
    name: 'Add or Remove Edit Identity & Contact Info',
    value: 'edit-identity'
}))
    .addUserOption((option) => option.setName('target').setDescription('The user'));

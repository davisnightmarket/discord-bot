import { SlashCommandBuilder } from 'discord.js';

export default new SlashCommandBuilder()
    .setName('nm')
    .setDescription('Do stuff with Night Market!')
    .addStringOption((option) =>
        option
            .setName('command')
            .setDescription('different commands do different things')
            .setRequired(true)
            .addChoices(
                {
                    name: 'Volunteer To Help',
                    value: 'volunteer'
                },
                {
                    name: 'Set Availability',
                    value: 'availability'
                },
                {
                    name: 'Grant Permissions',
                    value: 'permission'
                },
                {
                    name: 'Edit Identity & Contact Info',
                    value: 'identity'
                },
                {
                    name: 'Help & Docs',
                    value: 'help-and-docs'
                }
            )
    );

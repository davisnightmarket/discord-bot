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
                    name: 'Volunteer',
                    value: 'volunteer'
                },
                {
                    name: 'Set Availability',
                    value: 'set-availability'
                },
                {
                    name: 'Edit Identity',
                    value: 'edit-identity'
                },
                {
                    name: 'Help & Docs',
                    value: 'help-and-docs'
                }
            )
    );

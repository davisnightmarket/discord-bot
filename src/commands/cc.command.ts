import { SlashCommandBuilder } from 'discord.js';

export default new SlashCommandBuilder()
    .setName('cc')
    .setDescription('Do stuff with Night Market!')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('user')
            .setDescription('Select a User')
            .addUserOption((option) =>
                option.setName('target').setDescription('The user')
            )
            .addStringOption((option) =>
                option
                    .setName('command')
                    .setDescription('Edit Users')
                    .addChoices(
                        {
                            name: 'Add or Remove Volunteer Role',
                            value: 'volunteer'
                        },
                        {
                            name: 'Add or Remove Permissions',
                            value: 'set-permissons'
                        },
                        {
                            name: 'Add or Remove Availability',
                            value: 'set-availability'
                        },
                        {
                            name: 'Add or Remove Edit Identity & Contact Info',
                            value: 'edit-identity'
                        }
                    )
            )
    );

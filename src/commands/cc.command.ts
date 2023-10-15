import { SlashCommandBuilder } from 'discord.js';

export default new SlashCommandBuilder()
    .setName('cc')
    .setDescription('Do stuff with Night Market!')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('user')
            .setDescription('Select a User')
            .addUserOption((option) =>
                option.setName('Target').setDescription('The Marketeer')
            )
            .addStringOption((option) =>
                option.setName('Command').setDescription('Edit').addChoices(
                    {
                        name: 'Schedule',
                        value: 'volunteer'
                    },
                    {
                        name: 'Permissions',
                        value: 'permisson'
                    },
                    {
                        name: 'Availability',
                        value: 'availability'
                    },
                    {
                        name: 'Identity & Contact Info',
                        value: 'identity'
                    }
                )
            )
    );

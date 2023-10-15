import { SlashCommandBuilder } from 'discord.js';

export default new SlashCommandBuilder()
    .setName('cc')
    .setDescription('Edit Night Market')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('user')
            .setDescription('Select a Person')

            .addUserOption((option) =>
                option.setName('target').setDescription('The Person')
            )
            .addStringOption((option) =>
                option.setName('command').setDescription('Edit').addChoices(
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
                        name: 'Identity and Contact Info',
                        value: 'identity'
                    }
                )
            )
    );

import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    Guild
} from 'discord.js';
import { type GuildServiceModel } from '../model';
import { OpsListRequest } from '../events';
import { DAYS_OF_WEEK } from '../nm-const';

export default {
    data: new SlashCommandBuilder()
        .setName('pickups')
        .setDescription('Remind me '),
    // .addStringOption(
    //     (option) =>
    //         option
    //             .setName('day')
    //             .setDescription('The gif category')
    //             .setRequired(false)
    //     // .addChoices(
    //     //     ...DAYS_OF_WEEK.map((name) => ({
    //     //         name,
    //     //         value: name
    //     //     }))
    //     // )
    // )
    async execute(
        interaction: ChatInputCommandInteraction,
        services: GuildServiceModel
    ) {
        if (!interaction.guild) {
            interaction.reply({
                content: 'You can only use this command in a channel',
                ephemeral: true
            });
            return;
        }
        await OpsListRequest(services, interaction.guild, interaction);
    }
};

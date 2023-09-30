import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    Guild
} from 'discord.js';
import { type GuildServiceModel } from '../model';
import { PickupsListEvent } from '../events';

export default {
    data: new SlashCommandBuilder()
        .setName('pickups')
        .setDescription('send a reminder about whos doing pickups today'),
    async execute(
        interaction: ChatInputCommandInteraction,
        services: GuildServiceModel
    ) {
        // I think what we are doing here is saying that you cannot issue /command to crabapple directly
        // since you would not be in a guild.
        if (!interaction.guild) {
            interaction.reply({
                content: 'You can only use this command in a channel',
                ephemeral: true
            });
            return;
        }
        await PickupsListEvent(
            services,
            interaction.guild as Guild,
            interaction
        );
    }
};

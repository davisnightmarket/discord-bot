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
        // TODO: refactor this so that we can issue the command in any channel or directly to crabapple
        // todo: with the condition that you must pass a day arg but can leave of the day if you happen to be in a day channel.

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

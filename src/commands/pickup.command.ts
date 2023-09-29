import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { type GuildServiceModel } from '../model';
import { PickupsListRequestEvent } from '../events';

export default {
    data: new SlashCommandBuilder()
        .setName('pickups')
        .setDescription('send a reminder about whos doing pickups today'),
    async execute(
        interaction: ChatInputCommandInteraction,
        services: GuildServiceModel
    ) {
        if (!interaction.guild) {
            console.error('cannot interact outside of server');
            return;
        }
        await PickupsListRequestEvent(services, interaction.guild, interaction);
    }
};

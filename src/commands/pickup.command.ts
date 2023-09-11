import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { type GuildServiceModel } from "../model";
import { DailyPickupsWithoutThread } from "../jobs";

export default {
    data: new SlashCommandBuilder()
        .setName("pickups")
        .setDescription("send a reminder about whos doing pickups today"),
    async execute(interaction: ChatInputCommandInteraction, services: GuildServiceModel) {
        if (!interaction.guild) {
            await interaction.reply("ony works in server")
            return
        }

        await DailyPickupsWithoutThread(interaction.guild, services, interaction)
    }
}

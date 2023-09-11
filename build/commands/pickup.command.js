"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const jobs_1 = require("../jobs");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("pickups")
        .setDescription("send a reminder about whos doing pickups today"),
    async execute(interaction, services) {
        if (!interaction.guild) {
            await interaction.reply("ony works in server");
            return;
        }
        await (0, jobs_1.DailyPickupsWithoutThread)(interaction.guild, services, interaction);
    }
};

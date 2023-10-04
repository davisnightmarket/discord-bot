"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const events_1 = require("../events");
const nm_const_1 = require("../nm-const");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('pickups')
        .setDescription('Remind me ')
        .addStringOption((option) => option
        .setName('day')
        .setDescription('The gif category')
        .setRequired(false)
        .addChoices(...nm_const_1.DAYS_OF_WEEK.map((name) => ({
        name: name,
        value: name
    })))),
    async execute(interaction, services) {
        if (!interaction.guild) {
            interaction.reply({
                content: 'You can only use this command in a channel',
                ephemeral: true
            });
            return;
        }
        await (0, events_1.PickupsListEvent)(services, interaction.guild, interaction);
    }
};

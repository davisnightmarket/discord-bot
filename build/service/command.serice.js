"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandSerice = void 0;
const discord_js_1 = require("discord.js");
const commands_1 = __importDefault(require("../commands"));
const utility_1 = require("../utility");
class CommandSerice {
    async register(guild) {
        const services = await (0, utility_1.GetNmSecrets)();
        const rest = new discord_js_1.REST().setToken(services.discordConfig.appToken);
        await rest.put(discord_js_1.Routes.applicationGuildCommands(services.discordConfig.appId, guild.id), {
            body: commands_1.default.map((command) => command.data.toJSON())
        });
    }
    execute(services) {
        return async (interaction) => {
            if (!interaction.isChatInputCommand() || !interaction.guildId)
                return;
            const command = commands_1.default.find((command) => command.data.name === interaction.commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction, await services.getServicesForGuildId(interaction.guildId));
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                }
                else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        };
    }
}
exports.CommandSerice = CommandSerice;

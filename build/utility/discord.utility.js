"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteGuildCommand = exports.RegisterGuildCommand = exports.GetGuildRoleIdByName = exports.GetChannelByName = void 0;
const discord_js_1 = require("discord.js");
const commands_1 = __importDefault(require("../commands"));
const utility_1 = require("../utility");
function GetChannelByName(name, guild) {
    return guild?.channels.cache.find((c) => c.type === discord_js_1.ChannelType.GuildText && c.name === name.toLowerCase());
}
exports.GetChannelByName = GetChannelByName;
async function GetGuildRoleIdByName(guild, name) {
    const role = guild.roles.cache.find((role) => role.name === name);
    if (!role)
        return await guild.roles.create({ name }).then((role) => role.id);
    return role.id;
}
exports.GetGuildRoleIdByName = GetGuildRoleIdByName;
async function RegisterGuildCommand(guildId) {
    const { discordConfig } = await utility_1.NmSecrets;
    const rest = new discord_js_1.REST().setToken(discordConfig.appToken);
    await rest.put(discord_js_1.Routes.applicationGuildCommands(discordConfig.clientId, guildId), {
        body: commands_1.default.map((command) => command.data.toJSON())
    });
}
exports.RegisterGuildCommand = RegisterGuildCommand;
async function ExecuteGuildCommand(services, interaction) {
    if (!interaction.isChatInputCommand() || !interaction.guildId)
        return;
    if (!interaction.guild) {
        // todo: this should be user frienldier
        await interaction.reply('ony works in server');
        return;
    }
    const command = commands_1.default.find((command) => command.data.name === interaction.commandName);
    if (!command)
        return;
    try {
        await command.execute(interaction, services);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
        else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
}
exports.ExecuteGuildCommand = ExecuteGuildCommand;

import { Collection, REST, type Interaction, type SlashCommandBuilder, type Guild, Routes } from "discord.js";
import commands from '../commands';
import { GetNmSecrets } from "../utility";
import { type ConfigSerive } from ".";

interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction) => Promise<void>;
}

export class CommandSerice {
    async register(guild: Guild) {
        const services = await GetNmSecrets();

        const rest = new REST().setToken(services.discordConfig.appToken);

        await rest.put(
			Routes.applicationGuildCommands(services.discordConfig.appId, guild.id),
			{
                body: commands.map((command) => command.data.toJSON())
            },
		);
    }

    execute(services: ConfigSerive) {
        return async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand() || !interaction.guildId) return;

            const command = commands.find((command) => command.data.name === interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, await services.getServicesForGuildId(interaction.guildId));
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    }
}
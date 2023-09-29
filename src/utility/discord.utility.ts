import {
    REST,
    type Guild,
    Routes,
    ChannelType,
    type TextChannel,
    type Interaction
} from 'discord.js';
import Commands from '../commands';
import { NmSecrets } from '../utility';

import {} from 'discord.js';
import { GuildServiceModel } from '../model';

export function GetChannelByName(guild: Guild | null, name: string) {
    return guild?.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && c.name === name.toLowerCase()
    ) as TextChannel;
}

export async function GetGuildRoleIdByName(guild: Guild, name: string) {
    const role = guild.roles.cache.find((role) => role.name === name);
    if (!role)
        return await guild.roles.create({ name }).then((role) => role.id);
    return role.id;
}

export async function RegisterGuildCommand(guild: Guild) {
    if (!guild) {
        //todo: logger
        console.log(`Could not register commands  -- no guild given.`);
        return;
    }
    const services = await NmSecrets;

    const rest = new REST().setToken(services.discordConfig.appToken);

    await rest.put(
        Routes.applicationGuildCommands(services.discordConfig.appId, guild.id),
        {
            body: Commands.map((command) => command.data.toJSON())
        }
    );
}

export function ExecuteGuildCommand(services: GuildServiceModel) {
    return async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand() || !interaction.guildId) return;

        if (!interaction.guild) {
            // todo: this should be user frienldier
            await interaction.reply('ony works in server');
            return;
        }

        const command = Commands.find(
            (command) => command.data.name === interaction.commandName
        );

        if (!command) return;

        try {
            await command.execute(interaction, services);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }
    };
}

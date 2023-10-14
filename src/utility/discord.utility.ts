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
import { NmDayNameType } from '../model';

export async function GetChannelDayNameFromInteraction(
    interaction: Interaction
): Promise<NmDayNameType | undefined> {
    return (
        await interaction?.guild?.channels?.fetch(interaction?.channelId ?? '')
    )?.name as NmDayNameType;
}

export function GetChannelByName(name: string, guild: Guild | null) {
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

export async function RegisterGuildCommand(guildId: string) {
    const { discordConfig } = await NmSecrets;

    const rest = new REST().setToken(discordConfig.appToken);

    await rest.put(
        Routes.applicationGuildCommands(discordConfig.clientId, guildId),
        {
            body: Commands.map((command) => command.toJSON())
        }
    );
}

// We can handle interactions individually?
// export async function ExecuteGuildCommand(
//     services: GuildServiceModel,
//     interaction: Interaction
// ) {
//     if (!interaction.isChatInputCommand() || !interaction.guildId) return;

//     if (!interaction.guild) {
//         // todo: this should be user frienldier
//         await interaction.reply('ony works in server');
//         return;
//     }

//     const command = Commands.find(
//         (command) => command.data.name === interaction.commandName
//     );

//     if (!command) return;

//     try {
//         await command.execute(interaction, services);
//     } catch (error) {
//         console.error(error);
//         if (interaction.replied || interaction.deferred) {
//             await interaction.followUp({
//                 content: 'There was an error while executing this command!',
//                 ephemeral: true
//             });
//         } else {
//             await interaction.reply({
//                 content: 'There was an error while executing this command!',
//                 ephemeral: true
//             });
//         }
//     }
// }

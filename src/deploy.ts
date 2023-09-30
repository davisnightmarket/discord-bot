import { NmSecrets, GetAllGuildIds } from './utility';
import commands from './commands';
import { REST, Routes } from 'discord.js';

(async () => {
    try {
        const {
            discordConfig: { appToken }
        } = await NmSecrets;

        const rest = new REST().setToken(appToken);

        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );
        const body = commands.map((a) => a.data.toJSON());
        // The put method is used to fully refresh all commands in the guild with the current set
        const guildIdList = await GetAllGuildIds();
        for (const guildId of guildIdList) {
            await rest.put(Routes.applicationGuildCommands(appToken, guildId), {
                body
            });
            console.log(
                `Successfully reloaded ${body.length} application (/) commands.`
            );
        }
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

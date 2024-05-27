import { GetDebug, WaitingForConfig } from './utility';
import commands from './commands';
import { CoreDataService } from './service';
import { REST, Routes } from 'discord.js';

const dbg = GetDebug('Deploy');

(async () => {
    try {
        const {
            nmConfig,
            discordApiConfig: { clientId, appToken }
        } = await WaitingForConfig;
        const rest = new REST().setToken(appToken);
        dbg(`Started refreshing ${commands.length} application (/) commands.`);
        const body = commands.map((a) => a.toJSON());
        const coreDataService = new CoreDataService(nmConfig);
        // The put method is used to fully refresh all commands in the guild with the current set
        const guildIdList = await coreDataService.getAllGuildIds();

        for (const guildId of guildIdList) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
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

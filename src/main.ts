import { FoodCountInputEvent, FoodCountResponseEvent } from './events';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { NmSecrets, GetGuildServices, ExecuteGuildCommand } from './utility';

async function main() {
    // Add cron jobs
    //AddCron('* * 9 * *', FoodCountReminder);

    // Start discord client
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages
        ],
        partials: [Partials.Message, Partials.Channel]
    });

    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));

    client.on(Events.MessageCreate, async (client) => {
        // food count input
        FoodCountInputEvent(await GetGuildServices(client.guildId || ''));
    });
    client.on(Events.InteractionCreate, async (client) => {
        // food count response (cancel food count)
        FoodCountResponseEvent(client);
        // slash commands
        ExecuteGuildCommand(await GetGuildServices(client.guildId || ''));
    });

    const {
        discordConfig: { appToken }
    } = await NmSecrets;

    client.login(appToken);
}

main();

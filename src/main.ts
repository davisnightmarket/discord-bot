import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PickupChangeEvent
} from './events';
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

    // food count events
    client.on(Events.MessageCreate, async (client) => {
        FoodCountInputEvent(await GetGuildServices(client.guildId || ''));
    });
    client.on(Events.InteractionCreate, async (client) => {
        FoodCountResponseEvent(client);
    });

    // ops events
    client.on(Events.InteractionCreate, async (client) =>
        PickupChangeEvent(await GetGuildServices(client.guildId || ''), client)
    );

    // commands
    client.on(Events.InteractionCreate, async (client) => {
        ExecuteGuildCommand(await GetGuildServices(client.guildId || ''));
    });

    const {
        discordConfig: { appToken }
    } = await NmSecrets;

    client.login(appToken);
}

main();

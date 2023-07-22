import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PersonMetaEvent
} from './events';
import {
    Client,
    Events,
    GatewayIntentBits,
    GuildTextBasedChannel,
    Message,
    Partials
} from 'discord.js';
import { GetNmSecrets } from './utility/nm-secrets.utility';
import { type GuildServiceMapModel } from './model';
import { AddCron } from './utility/cron-utility';
import { FoodCountReminder, DailyPickupsWithoutThread } from './jobs';
import { CommandSerice, ConfigSerive } from './service';

async function main() {
    const services = new ConfigSerive();
    const commands = new CommandSerice();

    // Add cron jobs
    // AddCron('* * 9 * *', DailyPickupsThread);
    AddCron('* * 9 * *', FoodCountReminder);

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

    // build discord data
    client.once(Events.ClientReady, async (c) => {
        for (const guild of c.guilds.cache.values()) {
            commands.register(guild)
        }
        
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(GuildServiceMap));

    // food count events
    client.on(Events.MessageCreate, FoodCountInputEvent(services));
    client.on(Events.InteractionCreate, FoodCountResponseEvent);

    // commands
    client.on(Events.InteractionCreate, commands.execute(services))

    const {
        discordConfig: { appToken }
    } = await GetNmSecrets();

    client.login(appToken);
}

main();

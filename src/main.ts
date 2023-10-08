import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { NmSecrets, GetGuildServices } from './utility';
import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    NightListRequestEvent
} from './events';
import { AddCron } from './utility/cron.utility';
import { NightOpsJob, NightTimelineJob } from './jobs';

async function main() {
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

    // Add cron jobs
    AddCron(
        //        '30 7 * * *'
        '* * * * *',
        NightOpsJob(client)
    );

    AddCron(
        //        '30 7 * * *'
        '* * * * *',
        NightTimelineJob(client)
    );

    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(Events.MessageCreate, async (message) => {
        const services = await GetGuildServices(message.guildId ?? '');
        // food count input
        FoodCountInputEvent(services);
    });
    client.on(Events.InteractionCreate, async (interaction) => {
        const services = await GetGuildServices(interaction.guildId ?? '');

        // food count response (cancel food count)
        FoodCountResponseEvent(interaction);
        NightListRequestEvent(services, interaction);
    });

    const {
        discordConfig: { appToken }
    } = await NmSecrets;

    client.login(appToken);
}

main();

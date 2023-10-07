import {
    Client,
    type CommandInteraction,
    Events,
    GatewayIntentBits,
    Partials
} from 'discord.js';
import { NmSecrets, GetGuildServices, ExecuteGuildCommand } from './utility';
import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    NightListEvent,
    OpsListResponseEvent
} from './events';
import { AddCron } from './utility/cron.utility';

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
    AddCron('* * * * *', NightListEvent(client));
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
        // food count response (cancel food count)
        const services = await GetGuildServices(interaction.guildId ?? '');
        FoodCountResponseEvent(interaction);
        OpsListResponseEvent(services, interaction as CommandInteraction);
        // slash commands
        ExecuteGuildCommand(
            await GetGuildServices(interaction.guildId ?? ''),
            interaction
        );
    });

    const {
        discordConfig: { appToken }
    } = await NmSecrets;

    client.login(appToken);
}

main();

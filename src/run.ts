import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { NmSecrets, GetGuildServices, Dbg } from './utility';
import { AddCron } from './utility/cron.utility';
import { FoodCountReminderJob, NightOpsJob, NightTimelineJob } from './jobs';
import { FoodCountMessageEvent, WelcomeEvent } from './events';
import { RouteInteraction } from './route';

const dbg = Dbg('run');
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

run();

async function run() {
    // TODO: we have to remember that each guild could have a different timezone
    // so we need to figure out how to adjust the crons for each guild
    // Add cron jobs
    AddCron(
        '0 30 7 * * *', // 7:30 am, every day
        // '* * * * *', //every minute
        NightOpsJob(client)
    );

    AddCron(
        '0 30 23 * * *', // at 11:30pm
        NightTimelineJob(client)
    );

    // reminds us to enter food count IF none has been entered
    // AND pickups are scheduled
    AddCron(
        '0 0 12 * * *', // at high noon
        FoodCountReminderJob(client)
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
        try {
            FoodCountMessageEvent(services, message);
        } catch (e) {
            // todo: logger utility
            dbg(e);
        }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            RouteInteraction(interaction);
        } catch (e) {
            // todo: logger utility
            dbg(e);
        }
    });

    client.on(Events.GuildMemberAdd, (member) => {
        setTimeout(async () => {
            try {
                WelcomeEvent(member);
            } catch (e) {
                // todo: logger utility
                dbg(e);
            }

            // todo: add this to teh core config sheet
            // this is how long after a person arrives in our server that we send a welcome message
        }, 1000 * 60 * 60);
    });

    const {
        discordConfig: { appToken }
    } = await NmSecrets;

    client.login(appToken);
}

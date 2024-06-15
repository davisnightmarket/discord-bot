import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import http from 'http';
import {
    GetGuildServices,
    GetDebug,
    WaitingForConfig,
    AddCron
} from './utility';
import { FoodCountReminderJob, NightOpsJob, NightTimelineJob } from './jobs';
import { FoodCountMessageEvent, WelcomeEvent } from './events';
import { RouteInteraction } from './route';
import url from 'url';

const dbg = GetDebug('run');
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
    const config = await WaitingForConfig;
    // create a server object:

    http.createServer(async function (req, res) {
        console.log(req.url);
        const { pathname } = url.parse(req.url ?? '/');
        console.log(pathname);
        if (pathname === '/job/night-ops') {
            NightOpsJob(client)();
        }
        if (pathname === '/job/night-timeline') {
            NightTimelineJob(client)();
        }
        if (pathname === '/job/night-food-count-reminder') {
            FoodCountReminderJob(client)();
        }
        res.write('Hello World!'); // write a response to the client
        res.end(); // end the response
    }).listen(3000); // the server object listens on port 8080
    // TODO: we have to remember that each guild could have a different timezone
    // so we need to figure out how to adjust the crons for each guild
    // Add cron jobs

    AddCron(
        // twoice per hour, once on the hour, once on the half hour
        '0,30 * * * *',
        () => {
            const d = new Date();

            // get the current minutes
            const minutesElapsedInDayUTC =
                d.getUTCHours() * 60 + (d.getUTCMinutes() > 30 ? 30 : 0);

            // get the current minutes UTL
            // loop over market instances
            // get the current hour in that zone
        }
    );
    AddCron(
        '0 30 23 * * *', // at 11:30pm
        NightTimelineJob(client)
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
        discordApiConfig: { appToken }
    } = config;

    client.login(appToken);
}

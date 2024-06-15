"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const http_1 = __importDefault(require("http"));
const utility_1 = require("./utility");
const jobs_1 = require("./jobs");
const events_1 = require("./events");
const route_1 = require("./route");
const url_1 = __importDefault(require("url"));
const dbg = (0, utility_1.GetDebug)('run');
// Start discord client
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel]
});
run();
async function run() {
    const config = await utility_1.WaitingForConfig;
    // create a server object:
    http_1.default.createServer(async function (req, res) {
        console.log(req.url);
        const { pathname } = url_1.default.parse(req.url ?? '/');
        console.log(pathname);
        if (pathname === '/job/night-ops') {
            (0, jobs_1.NightOpsJob)(client)();
        }
        if (pathname === '/job/night-timeline') {
            (0, jobs_1.NightTimelineJob)(client)();
        }
        if (pathname === '/job/night-food-count-reminder') {
            (0, jobs_1.FoodCountReminderJob)(client)();
        }
        res.write('Hello World!'); // write a response to the client
        res.end(); // end the response
    }).listen(3000); // the server object listens on port 8080
    // TODO: we have to remember that each guild could have a different timezone
    // so we need to figure out how to adjust the crons for each guild
    // Add cron jobs
    // AddCron('', () => {
    //     tzOffset.offsetOf('America/Sao_Paulo');
    // });
    (0, utility_1.AddCron)(
    // twoice per hour, once on the hour, once on the half hour
    '0,30 * * * *', () => {
        const d = new Date();
        // get the current minutes
        const minutesElapsedInDayUTC = d.getUTCHours() * 60 + (d.getUTCMinutes() > 30 ? 30 : 0);
        // get the current minutes UTL
        // loop over market instances
        // get the current hour in that zone
    });
    (0, utility_1.AddCron)('0 30 23 * * *', // at 11:30pm
    (0, jobs_1.NightTimelineJob)(client));
    // reminds us to enter food count IF none has been entered
    // AND pickups are scheduled
    (0, utility_1.AddCron)('0 0 12 * * *', // at high noon
    (0, jobs_1.FoodCountReminderJob)(client));
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(discord_js_1.Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(discord_js_1.Events.MessageCreate, async (message) => {
        const services = await (0, utility_1.GetGuildServices)(message.guildId ?? '');
        // food count input
        try {
            (0, events_1.FoodCountMessageEvent)(services, message);
        }
        catch (e) {
            // todo: logger utility
            dbg(e);
        }
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        try {
            (0, route_1.RouteInteraction)(interaction);
        }
        catch (e) {
            // todo: logger utility
            dbg(e);
        }
    });
    client.on(discord_js_1.Events.GuildMemberAdd, (member) => {
        setTimeout(async () => {
            try {
                (0, events_1.WelcomeEvent)(member);
            }
            catch (e) {
                // todo: logger utility
                dbg(e);
            }
            // todo: add this to teh core config sheet
            // this is how long after a person arrives in our server that we send a welcome message
        }, 1000 * 60 * 60);
    });
    const { discordApiConfig: { appToken } } = config;
    client.login(appToken);
}

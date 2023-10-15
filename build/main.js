"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utility_1 = require("./utility");
const cron_utility_1 = require("./utility/cron.utility");
const jobs_1 = require("./jobs");
const events_1 = require("./events");
const route_1 = require("./route");
const dbg = (0, utility_1.Dbg)('main');
async function main() {
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
    // TODO: we have to remember that each guild could have a different timezone
    // so we need to figure out how to adjust the crons for each guild
    // Add cron jobs
    (0, cron_utility_1.AddCron)(
    // at 7:30am '0 30 7 * * *'
    '0 30 7 * * *', (0, jobs_1.NightOpsJob)(client));
    (0, cron_utility_1.AddCron)(
    // at 11:30pm '0 30 23 * * *'
    '0 30 23 * * *', (0, jobs_1.NightTimelineJob)(client));
    // reminds us to enter food count IF none has been entered
    // AND pickups are scheduled
    (0, cron_utility_1.AddCron)(
    // at high noon '0 12 1 * * *'
    '0 0 12 * * *', (0, jobs_1.FoodCountReminderJob)(client));
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(discord_js_1.Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(discord_js_1.Events.MessageCreate, async (message) => {
        const services = await (0, utility_1.GetGuildServices)(message.guildId ?? '');
        // food count input
        (0, events_1.FoodCountMessageEvent)(services);
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => (0, route_1.RouteInteraction)(interaction));
    client.on(discord_js_1.Events.GuildMemberAdd, (member) => {
        setTimeout(async () => {
            (0, events_1.WelcomeEvent)(member);
            // todo: add this to teh core config sheet
            // this is how long after a person arrives in our server that we send a welcome message
        }, 1000 * 60 * 60);
    });
    const { discordConfig: { appToken } } = await utility_1.NmSecrets;
    client.login(appToken);
}
main();

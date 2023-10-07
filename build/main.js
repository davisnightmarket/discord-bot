"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utility_1 = require("./utility");
const events_1 = require("./events");
const cron_utility_1 = require("./utility/cron.utility");
const jobs_1 = require("./jobs");
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
    // Add cron jobs
    (0, cron_utility_1.AddCron)('30 7 * * *', (0, jobs_1.NightListJob)(client));
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(discord_js_1.Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(discord_js_1.Events.MessageCreate, async (message) => {
        const services = await (0, utility_1.GetGuildServices)(message.guildId ?? '');
        // food count input
        (0, events_1.FoodCountInputEvent)(services);
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        const services = await (0, utility_1.GetGuildServices)(interaction.guildId ?? '');
        // food count response (cancel food count)
        (0, events_1.FoodCountResponseEvent)(interaction);
        (0, events_1.NightListRequestEvent)(services, interaction);
    });
    const { discordConfig: { appToken } } = await utility_1.NmSecrets;
    client.login(appToken);
}
main();

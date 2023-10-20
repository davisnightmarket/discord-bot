"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("./events");
const discord_js_1 = require("discord.js");
const nm_secrets_utility_1 = require("./utility/nm-secrets.utility");
const cron_utility_1 = require("./utility/cron-utility");
const jobs_1 = require("./jobs");
const service_1 = require("./service");
async function main() {
    const services = new service_1.ConfigSerive();
    const commands = new service_1.CommandSerice();
    // Add cron jobs
    (0, cron_utility_1.AddCron)('* * 9 * *', jobs_1.FoodCountReminder);
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
    // build discord data
    client.once(discord_js_1.Events.ClientReady, async (c) => {
        for (const guild of c.guilds.cache.values()) {
            commands.register(guild);
        }
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    // food count events
    client.on(discord_js_1.Events.MessageCreate, (0, events_1.FoodCountInputEvent)(services));
    client.on(discord_js_1.Events.InteractionCreate, events_1.FoodCountResponseEvent);
    // pickup events
    client.on(discord_js_1.Events.InteractionCreate, (0, jobs_1.PickupsRefreshEvent)(services));
    // commands
    client.on(discord_js_1.Events.InteractionCreate, commands.execute(services));
    const { discordConfig: { appToken } } = await (0, nm_secrets_utility_1.GetNmSecrets)();
    client.login(appToken);
}
main();

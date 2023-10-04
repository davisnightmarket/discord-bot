"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utility_1 = require("./utility");
const events_1 = require("./events");
async function main() {
    // Add cron jobs
    //AddCron('* * 9 * *', FoodCountReminder);
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
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(discord_js_1.Events.MessageCreate, async (client) => {
        // food count input
        (0, events_1.FoodCountInputEvent)(await (0, utility_1.GetGuildServices)(client.guildId || ''));
    });
    client.on(discord_js_1.Events.InteractionCreate, async (client) => {
        // food count response (cancel food count)
        (0, events_1.FoodCountResponseEvent)(client);
        // slash commands
        (0, utility_1.ExecuteGuildCommand)(await (0, utility_1.GetGuildServices)(client.guildId || ''));
    });
    const { discordConfig: { appToken } } = await utility_1.NmSecrets;
    client.login(appToken);
}
main();

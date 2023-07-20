"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("./events");
const discord_js_1 = require("discord.js");
const nm_secrets_utility_1 = require("./utility/nm-secrets.utility");
const utility_1 = require("./utility");
const cron_utility_1 = require("./utility/cron-utility");
const jobs_1 = require("./jobs");
const GuildServiceMap = {};
async function main() {
    // Add cron jobs
    // AddCron('* * 9 * *', DailyPickupsThread);
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
        console.log(`Ready! Logged in as ${c.user.tag}`);
        // set up instances of services for each server crabapple is one
        for (const guild of client.guilds.cache.values()) {
            const config = (0, utility_1.ConfigInstanceByGuildIdGet)(guild.id);
            if (!config) {
                console.log(`No config found for ${guild.name}`);
                continue;
            }
            GuildServiceMap[guild.id] = (0, utility_1.InitInstanceServices)(config);
        }
        for (const guild of c.guilds.cache.values()) {
            (0, jobs_1.DailyPickupsWithoutThread)(guild, GuildServiceMap[guild.id]);
        }
    });
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(GuildServiceMap));
    // food count events
    client.on(discord_js_1.Events.MessageCreate, (0, events_1.FoodCountInputEvent)(GuildServiceMap));
    client.on(discord_js_1.Events.InteractionCreate, events_1.FoodCountResponseEvent);
    const { discordConfig: { appToken } } = await (0, nm_secrets_utility_1.GetNmSecrets)();
    client.login(appToken);
}
main();

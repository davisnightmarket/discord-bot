"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("./events");
const discord_js_1 = require("discord.js");
const nm_secrets_utility_1 = require("./utility/nm-secrets.utility");
const utility_1 = require("./utility");
const cron_utility_1 = require("./utility/cron-utility");
const jobs_1 = require("./jobs");
const GuildServiceMap = {};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
        client.once(discord_js_1.Events.ClientReady, (c) => __awaiter(this, void 0, void 0, function* () {
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
                (0, jobs_1.DailyPickupsThread)(guild, GuildServiceMap[guild.id]);
            }
        }));
        // person meta data events
        // client.on(Events.MessageCreate, PersonMetaEvent(GuildServiceMap));
        // food count events
        client.on(discord_js_1.Events.MessageCreate, (0, events_1.FoodCountInputEvent)(GuildServiceMap));
        client.on(discord_js_1.Events.InteractionCreate, events_1.FoodCountResponseEvent);
        const { discordConfig: { appToken } } = yield (0, nm_secrets_utility_1.GetNmSecrets)();
        client.login(appToken);
    });
}
main();

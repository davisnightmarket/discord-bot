import { FoodCountInputEvent, FoodCountResponseEvent } from './events';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { GetNmSecrets } from './utility/nm-secrets.utility';
import { GetInstanceServicesByGuildId } from './utility';
import { type GuildServiceMapModel } from './model';
import { AddCron } from './utility/cron-utility';
import { FoodCountReminder, DailyPickupsThread } from './jobs';

const GuildServiceMap: GuildServiceMapModel = {};

async function main() {
    // Add cron jobs
    // todo: add cron reminder times to instance config spreadsheet?
    AddCron('* * 9 * *', DailyPickupsThread);
    AddCron('* * 8 * *', FoodCountReminder);

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

    // build discord data
    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);

        // set up instances of services for each server crabapple is one
        for (const guild of client.guilds.cache.values()) {
            try {
                GuildServiceMap[guild.id] = await GetInstanceServicesByGuildId(
                    guild.id
                );
            } catch (e: any) {
                console.log(e);
                console.log(
                    `Could not create a guild service for ${guild.id}:`
                );
            }
        }
    });

    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(GuildServiceMap));

    // food count events
    client.on(Events.MessageCreate, FoodCountInputEvent(GuildServiceMap));
    client.on(Events.InteractionCreate, FoodCountResponseEvent);

    const {
        discordConfig: { appToken }
    } = await GetNmSecrets();

    client.login(appToken);
}

main();

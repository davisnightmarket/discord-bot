import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PersonMetaEvent
} from './events';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { GetNmSecrets } from './utility/nm-secrets.utility';
import { ConfigInstanceByGuildIdGet } from './utility';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonService
} from './nm-service';
import { type GuildServiceMapModel } from './model';
import { AddCron } from './utility/cron-utility';
import { DailyPickupsThread } from './jobs';

const GuildServiceMap: GuildServiceMapModel = {};

async function main() {
    // Add cron jobs
    AddCron('* * 9 * *', DailyPickupsThread);

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
            const config = ConfigInstanceByGuildIdGet(guild.id);

            if (!config) {
                console.log(`No config found for ${guild.name}`);
                continue;
            }

            const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);
            GuildServiceMap[guild.id] = {
                foodCountDataInstanceService: new NmFoodCountDataService(
                    config.GSPREAD_FOODCOUNT_ID
                ),
                foodCountInputInstanceService: new NmFoodCountInputService(
                    orgCoreService
                ),
                orgCoreService,
                personCoreService: new NmPersonService(
                    config.GSPREAD_CORE_PERSON_ID
                )
            };
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

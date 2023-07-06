import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PersonMetaEvent
} from './events';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { GetNmSecrets } from './utility/nm-secrets.utility';
import {
    ConfigCoreGet,
    ConfigInstanceByGuildIdGet,
    ConfigInstanceIdByGuildIdGet
} from './utility';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonService
} from './nm-service';
import { GuildServiceMapModel } from './model';

const GuildServiceMap: GuildServiceMapModel = {};

async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages
        ],
        partials: [Partials.Message, Partials.Channel]
    });

    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);

        // OK, here we loop through guilds and build a service instance for each
        const GuildIdList = client.guilds.cache.map((guild) => guild.id);

        for (const guildId of GuildIdList) {
            const instanceId = await ConfigInstanceIdByGuildIdGet(guildId);
            if (!instanceId) {
                console.log(`No Instance ID found for guild ${guildId}`);
            } else {
                const coreConfig = await ConfigCoreGet();
                const instanceConfig = await ConfigInstanceByGuildIdGet(
                    instanceId
                );

                if (!instanceConfig) {
                    console.error(
                        `No config for: ${instanceId} (${guildId})! Guild is not enabled.`
                    );
                    // in this case we do not create a serviceMap for the guild
                    continue;
                }

                const orgCoreService = new NmOrgService(
                    coreConfig.GSPREAD_CORE_ORG_ID
                );

                GuildServiceMap[guildId] = {
                    foodCountDataInstanceService: new NmFoodCountDataService(
                        instanceConfig.GSPREAD_FOODCOUNT_ID
                    ),
                    foodCountInputInstanceService: new NmFoodCountInputService(
                        orgCoreService
                    ),
                    orgCoreService,
                    personCoreService: new NmPersonService(
                        coreConfig.GSPREAD_CORE_PERSON_ID
                    )
                };
            }
        }
    });

    // person meta data events
    client.on(Events.MessageCreate, PersonMetaEvent(GuildServiceMap));

    // food count events
    client.on(Events.MessageCreate, FoodCountInputEvent(GuildServiceMap));
    client.on(Events.InteractionCreate, FoodCountResponseEvent);

    const {
        discordConfig: { appToken }
    } = await GetNmSecrets();

    client.login(appToken);
}

main();

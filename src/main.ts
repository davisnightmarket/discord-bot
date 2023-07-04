import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PersonMetaEvent
} from './events';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { GetNmSecrets } from './utility/nm-secrets.utility';
import { ConfigByGuildIdGet, ConfigReplicaIdByGuildIdGet } from './utility';
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

        const GuildIdList = client.guilds.cache.map((guild) => guild.id);

        for (const guildId of GuildIdList) {
            const instanceId = ConfigReplicaIdByGuildIdGet(guildId);
            if (!instanceId) {
                console.log(`No Instance ID found for guild ${guildId}`);
            } else {
                const config = await ConfigByGuildIdGet(instanceId);
                if (!config) {
                    console.error(
                        `No config for: ${instanceId} (${guildId})! Guild is not enabled.`
                    );
                }
                const orgService = new NmOrgService(
                    config.coreConfig.GSPREAD_CORE_ORG_ID
                );

                GuildServiceMap[guildId] = {
                    foodCountDataService: new NmFoodCountDataService(
                        config.replicaConfig.GSPREAD_FOODCOUNT_ID
                    ),
                    foodCountInputService: new NmFoodCountInputService(
                        orgService
                    ),
                    orgService,
                    personService: new NmPersonService(
                        config.coreConfig.GSPREAD_CORE_PERSON_ID
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

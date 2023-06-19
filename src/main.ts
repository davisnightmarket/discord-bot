import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PersonMetaEvent
} from './events';
import {
    Client,
    Events,
    GatewayIntentBits,
    type Message,
    Partials
} from 'discord.js';
import { NmConfigService } from './nm-service';

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
    });

    // person meta data events
    client.on(Events.MessageCreate, PersonMetaEvent);

    // food count events
    client.on(Events.MessageCreate, FoodCountInputEvent);
    client.on(Events.InteractionCreate, FoodCountResponseEvent);

    const {
        discordConfig: { appToken }
    } = await NmConfigService.getParsed();

    client.login(appToken);
}

main();

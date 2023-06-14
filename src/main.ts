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

    // todo: this will file on every message sent. we probably
    // want a big switchboard and fire different stuff depending on
    // parameters. The reason we create on one message create event
    // is that I think this saves us data costs
    client.on(Events.MessageCreate, (message: Message) => {
        // here we want to know who people are, so we ask
        PersonMetaEvent(message);

        // when someone enters a foox count
        FoodCountInputEvent(message);
    });

    // todo: this will file on every interaction sent. we probably
    // want a big switchboard and fire different stuff depending on
    // parameters
    client.on(Events.InteractionCreate, FoodCountResponseEvent);

    const {
        discordConfig: { appToken }
    } = await NmConfigService.getParsed();

    client.login(appToken);
}

main();

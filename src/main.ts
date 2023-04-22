import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    PersonMetaEvent
} from './events';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { NmConfigService } from './nm-service';
import { Config } from './config';

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
    // todo: do we want this on every connection?
    // const commands = await loadCommands();
    // client.on(Events.InteractionCreate, async (c) => {
    //     console.log(c);
    //     console.log(`Hi!`);
    // });
    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });
    // todo: this will file on every message sent. we probably
    // want a big switchboard and fire different stuff depending on
    // parameters. The reason we create on one message create event
    // is that I think this saves us data costs
    client.on(Events.MessageCreate, (client) => {
        // here we want to know who people are, so we ask
        PersonMetaEvent(client);

        // when someone enters a foox count
        FoodCountInputEvent(client);
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

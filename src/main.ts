import {
    ChatInputCommandInteraction,
    Client,
    Events,
    GatewayIntentBits,
    Partials
} from 'discord.js';
import { NmSecrets, GetGuildServices, Dbg } from './utility';
import {
    FoodCountInputEvent,
    FoodCountResponseEvent,
    IdentityEditAvailabilityEvent,
    VolunteerRequestEvent,
    VolunteerResponseEvent,
    WelcomeEvent,
    IdentityEditEvent,
    IdentitySubmitEvent
} from './events';
import { AddCron } from './utility/cron.utility';
import { NightOpsJob, NightTimelineJob } from './jobs';

const dbg = Dbg('main');

async function main() {
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

    // TODO: we have to remember that each guild could have a different timezone
    // so we need to figure out how to adjust the crons for each guild
    // Add cron jobs
    AddCron(
        // at 7:30am '0 30 7 * * *'
        '0 30 7 * * *',
        NightOpsJob(client)
    );

    AddCron(
        // at midnight:30am '0 1 1 * * *'
        '0 1 1 * *',
        NightTimelineJob(client)
    );

    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(Events.MessageCreate, async (message) => {
        const services = await GetGuildServices(message.guildId ?? '');
        // food count input
        FoodCountInputEvent(services);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        dbg(Events.InteractionCreate);
        interaction = interaction as ChatInputCommandInteraction;

        const services = await GetGuildServices(interaction.guildId ?? '');
        if (interaction?.commandName == 'nm') {
            dbg('nm /Command');
            if (interaction.options.getString('command') === 'volunteer') {
                VolunteerRequestEvent(services, interaction);
            }
            // ToDO: automate this
            if (
                interaction.options.getString('command') === 'set-availability'
            ) {
                dbg('Editing Availability');
                IdentityEditAvailabilityEvent(services, interaction);
            }
            if (interaction.options.getString('command') === 'edit-identity') {
                dbg('Editing identity');
                IdentityEditEvent(services, interaction);
            }

            if (interaction.options.getString('command') === 'help-and-docs') {
                dbg('help-and-docs');
                interaction.reply('Coming soon!');
            }

            return;
        } else if (interaction.isModalSubmit()) {
            dbg('isModalSubmit');
            IdentitySubmitEvent(services, interaction);
        } else {
            dbg('else');
            FoodCountResponseEvent(interaction);

            // todo: these are redundant if we use /nm command
            VolunteerRequestEvent(services, interaction);
            VolunteerResponseEvent(services, interaction);
        }
    });

    client.on(Events.GuildMemberAdd, (member) => {
        setTimeout(async () => {
            WelcomeEvent(member);
            // todo: add this to teh core config sheet
            // this is how long after a person arrives in our server that we send a welcome message
        }, 1000 * 60 * 60);
    });

    const {
        discordConfig: { appToken }
    } = await NmSecrets;

    client.login(appToken);
}

main();

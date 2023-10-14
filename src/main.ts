import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    Events,
    GatewayIntentBits,
    Partials,
    StringSelectMenuInteraction
} from 'discord.js';
import { NmSecrets, GetGuildServices, Dbg } from './utility';
import {
    FoodCountDeleteButtonEvent,
    FoodCountMessageEvent,
    AvailabilityAndPermissionCommandEvent,
    AvailabilityEditButtonEvent,
    PermissionEditButtonEvent,
    VolunteerCommandEvent,
    VolunteerEditButtonEvent,
    WelcomeEvent,
    IdentityCommandEvent,
    IdentityEditModalEvent,
    HelpAndDocsCommandEvent
} from './events';
import { AddCron } from './utility/cron.utility';
import { FoodCountReminderJob, NightOpsJob, NightTimelineJob } from './jobs';

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
        // at 11:30pm '0 30 23 * * *'
        '0 30 23 * * *',
        NightTimelineJob(client)
    );

    // reminds us to enter food count IF none has been entered
    // AND pickups are scheduled
    AddCron(
        // at high noon '0 12 1 * * *'
        '0 0 12 * * *',
        FoodCountReminderJob(client)
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
        FoodCountDeleteButtonEvent(services);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        dbg(Events.InteractionCreate);
        interaction = interaction as ChatInputCommandInteraction;

        const services = await GetGuildServices(interaction.guildId ?? '');
        if (interaction?.isCommand()) {
            if (interaction?.commandName == 'nm') {
                dbg('/nm Command');
                if (interaction.options.getString('command') === 'volunteer') {
                    VolunteerCommandEvent(services, interaction);
                }
                // ToDO: automate this
                if (
                    interaction.options.getString('command') ===
                    'set-availability'
                ) {
                    dbg('Editing Availability');
                    AvailabilityAndPermissionCommandEvent(
                        services,
                        interaction
                    );
                }
                if (
                    interaction.options.getString('command') === 'edit-identity'
                ) {
                    dbg('Editing identity');
                    IdentityCommandEvent(services, interaction);
                }

                if (
                    interaction.options.getString('command') === 'help-and-docs'
                ) {
                    dbg('help-and-docs');
                    HelpAndDocsCommandEvent(services, interaction);
                }
            }
            dbg(interaction?.commandName, 'command name');
            if (interaction?.commandName == 'cc') {
                dbg('/cc Command');
                // todo: make sure they are a CC
                // todo: we don't want to rely on discord role records, we want to geth from the admin sheet of the night spreadsheet
                interaction.reply(
                    ((interaction.options.getString('command') || '') +
                        interaction.options.getUser('target')?.id || '') +
                        ' coming soon!'
                );
            }
        } else if (interaction.isModalSubmit()) {
            dbg('isModalSubmit');
            IdentityEditModalEvent(services, interaction);
        }
        // we can lump these two together since they are both routed by customId
        else if (interaction.isStringSelectMenu() || interaction.isButton()) {
            dbg(
                (
                    interaction as StringSelectMenuInteraction
                ).isStringSelectMenu()
                    ? 'isStringSelectMenu'
                    : 'isButton'
            );

            AvailabilityEditButtonEvent(
                services,
                interaction,
                (interaction as ButtonInteraction)?.customId || ''
            );
            PermissionEditButtonEvent(
                services,
                interaction,
                (interaction as ButtonInteraction)?.customId || ''
            );
            VolunteerEditButtonEvent(
                services,
                interaction,
                (interaction as ButtonInteraction)?.customId || ''
            );
        } else {
            dbg('otherwise this is a message content trigger');
            FoodCountMessageEvent(interaction);

            // todo: this should be split into different events
            // uses buttons and selects to handle different volunteering steps
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

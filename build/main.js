"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utility_1 = require("./utility");
const events_1 = require("./events");
const cron_utility_1 = require("./utility/cron.utility");
const jobs_1 = require("./jobs");
const dbg = (0, utility_1.Dbg)('main');
async function main() {
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
    // TODO: we have to remember that each guild could have a different timezone
    // so we need to figure out how to adjust the crons for each guild
    // Add cron jobs
    (0, cron_utility_1.AddCron)(
    // at 7:30am '0 30 7 * * *'
    '0 30 7 * * *', (0, jobs_1.NightOpsJob)(client));
    (0, cron_utility_1.AddCron)(
    // at 11:30pm '0 30 23 * * *'
    '0 30 23 * * *', (0, jobs_1.NightTimelineJob)(client));
    // reminds us to enter food count IF none has been entered
    // AND pickups are scheduled
    (0, cron_utility_1.AddCron)(
    // at high noon '0 12 1 * * *'
    '0 0 12 * * *', (0, jobs_1.FoodCountReminderJob)(client));
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(discord_js_1.Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(discord_js_1.Events.MessageCreate, async (message) => {
        const services = await (0, utility_1.GetGuildServices)(message.guildId ?? '');
        // food count input
        (0, events_1.FoodCountDeleteButtonEvent)(services);
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        dbg(discord_js_1.Events.InteractionCreate);
        interaction = interaction;
        const services = await (0, utility_1.GetGuildServices)(interaction.guildId ?? '');
        if (interaction?.isCommand()) {
            if (interaction?.commandName == 'nm') {
                dbg('/nm Command');
                if (interaction.options.getString('command') === 'volunteer') {
                    (0, events_1.VolunteerCommandEvent)(services, interaction);
                }
                // ToDO: automate this
                if (interaction.options.getString('command') ===
                    'set-availability') {
                    dbg('Editing Availability');
                    (0, events_1.AvailabilityAndPermissionCommandEvent)(services, interaction);
                }
                if (interaction.options.getString('command') === 'edit-identity') {
                    dbg('Editing identity');
                    (0, events_1.IdentityCommandEvent)(services, interaction);
                }
                if (interaction.options.getString('command') === 'help-and-docs') {
                    dbg('help-and-docs');
                    (0, events_1.HelpAndDocsCommandEvent)(services, interaction);
                }
            }
            dbg(interaction?.commandName, 'command name');
            if (interaction?.commandName == 'cc') {
                dbg('/cc Command');
                // todo: make sure they are a CC
                // todo: we don't want to rely on discord role records, we want to geth from the admin sheet of the night spreadsheet
                interaction.reply(((interaction.options.getString('command') || '') +
                    interaction.options.getUser('target')?.id || '') +
                    ' coming soon!');
            }
        }
        else if (interaction.isModalSubmit()) {
            dbg('isModalSubmit');
            (0, events_1.IdentityEditModalEvent)(services, interaction);
        }
        // we can lump these two together since they are both routed by customId
        else if (interaction.isStringSelectMenu() || interaction.isButton()) {
            dbg(interaction.isStringSelectMenu()
                ? 'isStringSelectMenu'
                : 'isButton');
            (0, events_1.AvailabilityEditButtonEvent)(services, interaction, interaction?.customId || '');
            (0, events_1.PermissionEditButtonEvent)(services, interaction, interaction?.customId || '');
            (0, events_1.VolunteerEditButtonEvent)(services, interaction, interaction?.customId || '');
        }
        else {
            dbg('otherwise this is a message content trigger');
            (0, events_1.FoodCountMessageEvent)(interaction);
            // todo: this should be split into different events
            // uses buttons and selects to handle different volunteering steps
        }
    });
    client.on(discord_js_1.Events.GuildMemberAdd, (member) => {
        setTimeout(async () => {
            (0, events_1.WelcomeEvent)(member);
            // todo: add this to teh core config sheet
            // this is how long after a person arrives in our server that we send a welcome message
        }, 1000 * 60 * 60);
    });
    const { discordConfig: { appToken } } = await utility_1.NmSecrets;
    client.login(appToken);
}
main();

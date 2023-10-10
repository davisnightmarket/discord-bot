"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utility_1 = require("./utility");
const events_1 = require("./events");
const cron_utility_1 = require("./utility/cron.utility");
const jobs_1 = require("./jobs");
const identity_edit_event_1 = require("./events/identity-edit.event");
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
    // at midnight:30am '0 1 1 * * *'
    '0 1 1 * *', (0, jobs_1.NightTimelineJob)(client));
    // person meta data events
    // client.on(Events.MessageCreate, PersonMetaEvent(services));
    client.on(discord_js_1.Events.ClientReady, async () => {
        // food count input
        console.log('Crabapple READY!');
    });
    client.on(discord_js_1.Events.MessageCreate, async (message) => {
        const services = await (0, utility_1.GetGuildServices)(message.guildId ?? '');
        // food count input
        (0, events_1.FoodCountInputEvent)(services);
    });
    // client.on(Events.InteractionCreate, async (interaction) => {
    //     const services = await GetGuildServices(interaction.guildId ?? '');
    //     // food count response (cancel food count)
    //     FoodCountResponseEvent(interaction);
    //     NightListRequestEvent(services, interaction);
    // });
    // this one is dedicated to the /nm command
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        interaction = interaction;
        const services = await (0, utility_1.GetGuildServices)(interaction.guildId ?? '');
        if (interaction?.commandName == 'nm') {
            // if (interaction.options.getString('command') === 'volunteer') {
            //     VolunteerRequestEvent(services, interaction);
            // }
            // ToDO: automate this
            if (interaction.options.getString('command') === 'set-availability') {
                console.log('Editing Availability');
                (0, events_1.IdentityEditAvailabilityEvent)(services, interaction);
            }
            if (interaction.options.getString('command') === 'edit-identity') {
                console.log('Editing identity');
                (0, identity_edit_event_1.IdentityEditEvent)(services, interaction);
            }
            if (interaction.options.getString('command') === 'help-and-docs') {
                interaction.reply('Coming soon!');
            }
            return;
        }
        else {
            (0, events_1.FoodCountResponseEvent)(interaction);
            (0, events_1.VolunteerRequestEvent)(services, interaction);
            (0, events_1.VolunteerResponseEvent)(services, interaction);
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

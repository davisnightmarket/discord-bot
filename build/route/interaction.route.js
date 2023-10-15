"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteInteraction = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
const events_1 = require("../events");
const dbg = (0, utility_1.Dbg)('RouteInteraction');
async function RouteInteraction(interaction) {
    dbg(discord_js_1.Events.InteractionCreate);
    interaction = interaction;
    const services = await (0, utility_1.GetGuildServices)(interaction.guildId ?? '');
    if (interaction?.isCommand()) {
        let command = 'NONE';
        try {
            command = interaction.options.getString('command') || 'NONE';
        }
        catch (e) {
            dbg('NO command found');
        }
        dbg(`Command: ${command}`);
        if (interaction?.commandName == 'nm') {
            dbg('/nm Command');
            if (command === 'volunteer') {
                (0, events_1.VolunteerCommandEvent)(services, interaction, interaction.user.id);
            }
            // ToDO: automate this
            if (command === 'availability') {
                dbg('Editing Availability');
                (0, events_1.AvailabilityCommandEvent)(services, interaction, interaction.user.id);
            }
            if (command === 'permission') {
                dbg('Editing permission');
                (0, events_1.PermissionCommandEvent)(services, interaction, interaction.user.id);
            }
            if (command === 'identity') {
                dbg('Editing identity');
                (0, events_1.IdentityCommandEvent)(services, interaction, interaction.user.id);
            }
            if (command === 'help-and-docs') {
                dbg('help-and-docs');
                (0, events_1.HelpAndDocsCommandEvent)(services, interaction);
            }
        }
        // restrict to community coordinator
        if (interaction?.commandName == 'cc') {
            dbg('/cc Command');
            // todo: make sure they are a CC
            // todo: we don't want to rely on discord role records, we want to geth from the admin sheet of the night spreadsheet
            // const { nightDataService } = services;
            // const ccList = await nightDataService.getCommunityCoordinatorList();
            // if(!ccList.map(a=>a.discordId).includes(interaction.user.id)){
            // show how to become a cc message and return
            // return
            //}
            const target = interaction.options.getUser('target');
            if (!command) {
                interaction.reply(' CC how-to docs and help coming soon!');
                return;
            }
            if (!target) {
                interaction.reply(`CC ${command} how-to coming soon!`);
                return;
            }
            if (command === 'volunteer') {
                (0, events_1.VolunteerCommandEvent)(services, interaction, target.id);
            }
            // ToDO: automate this
            if (command === 'availability') {
                dbg('Editing Availability');
                (0, events_1.AvailabilityCommandEvent)(services, interaction, target.id);
            }
            if (command === 'permission') {
                dbg('Editing permission');
                (0, events_1.PermissionCommandEvent)(services, interaction, target.id);
            }
            if (command === 'identity') {
                dbg('Editing identity');
                (0, events_1.IdentityCommandEvent)(services, interaction, target.id);
            }
        }
    }
    // we can lump these two together since they are both routed by customId
    else if (interaction.isStringSelectMenu() ||
        interaction.isButton() ||
        interaction.isModalSubmit()) {
        const args = interaction.customId.split('--');
        // by convention, the last arg is the discordId
        const discordId = args.pop();
        const command = args[0];
        dbg('Modal, Button or Select!', command, discordId, interaction.isStringSelectMenu()
            ? 'isStringSelectMenu'
            : 'isButton');
        if (interaction.isModalSubmit()) {
            dbg('isModalSubmit');
            (0, events_1.IdentityEditModalEvent)(services, interaction, discordId, args);
        }
        if (interaction.isStringSelectMenu()) {
            dbg('isStringSelectMenu');
            (0, events_1.PermissionEditSelectEvent)(services, interaction, discordId, args);
            (0, events_1.AvailabilityEditSelectEvent)(services, interaction, discordId, args);
        }
        if (interaction.isButton()) {
            dbg('isButton');
            (0, events_1.FoodCountDeleteButtonEvent)(interaction, args);
            (0, events_1.AvailabilityEditButtonEvent)(services, interaction, discordId, args);
            (0, events_1.PermissionButtonEvent)(services, interaction, discordId, args);
            (0, events_1.VolunteerInitButtonEvent)(services, interaction, discordId, args);
        }
    }
}
exports.RouteInteraction = RouteInteraction;

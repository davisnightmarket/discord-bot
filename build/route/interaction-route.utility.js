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
        dbg('Command!');
        if (interaction?.commandName == 'nm') {
            const command = interaction.options.getString('command');
            dbg('/nm Command');
            if (command === 'volunteer') {
                (0, events_1.VolunteerCommandEvent)(services, interaction, interaction.user.id, interaction.commandName.split('--'));
            }
            // ToDO: automate this
            if (command === 'availability') {
                dbg('Editing Availability');
                (0, events_1.AvailabilityCommandEvent)(services, interaction);
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
            interaction.reply(((interaction.options.getString('command') || '') +
                interaction.options.getUser('target')?.id || '') +
                ' coming soon!');
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
            (0, events_1.IdentityEditModalEvent)(services, interaction, discordId);
        }
        if (interaction.isStringSelectMenu()) {
            dbg('isStringSelectMenu');
            (0, events_1.PermissionEditButtonEvent)(services, interaction, discordId, (interaction?.customId || '').split('--'));
        }
        if (interaction.isButton()) {
            dbg('isButton');
            (0, events_1.FoodCountDeleteButtonEvent)(interaction, args);
            (0, events_1.AvailabilityEditButtonEvent)(services, interaction, interaction?.customId.split('--'));
            (0, events_1.PermissionRevokeButtonEvent)(services, interaction, discordId, (interaction?.customId || '').split('--'));
            (0, events_1.VolunteerInitButtonEvent)(services, interaction, interaction?.customId || '', (interaction?.customId || '').split('--'));
        }
    }
}
exports.RouteInteraction = RouteInteraction;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CcEvent = void 0;
async function CcEvent({ interaction }) {
    if (interaction.commandName === 'volunteer') {
        return;
    }
    if (interaction.commandName === 'availability') {
        return;
    }
    if (interaction.commandName === 'permisson') {
        return;
    }
    if (interaction.commandName === 'identity') {
        interaction.reply('About cc role ...');
        return;
    }
}
exports.CcEvent = CcEvent;
// export async function CcUserContactListEvent({
//     interaction
// }: {
//     interaction: CommandInteraction;
// }) {
//     interaction.reply('About cc role ...');
// }
// export async function CcUserVolunteerListEvent({
//     interaction
// }: {
//     interaction: CommandInteraction;
// }) {
//     interaction.reply('About cc role ...');
// }

import { CommandInteraction } from 'discord.js';

export async function CcEvent({
    interaction
}: {
    interaction: CommandInteraction;
}) {
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

import { CommandInteraction } from 'discord.js';

export async function CcEvent({
    interaction
}: {
    interaction: CommandInteraction;
}) {
    if (interaction.commandName !== 'cc') {
        return;
    }
    interaction.reply('About cc command ...');
}

export async function CcUserAvailabilityListEvent({
    interaction
}: {
    interaction: CommandInteraction;
}) {
    interaction.reply('About cc role ...');
}

// responds with an ephemeral message listing the user contact infor
// as long as they have given permission

export async function CcUserContactListEvent({
    interaction
}: {
    interaction: CommandInteraction;
}) {
    interaction.reply('About cc role ...');
}

export async function CcUserVolunteerListEvent({
    interaction
}: {
    interaction: CommandInteraction;
}) {
    interaction.reply('About cc role ...');
}

import { type ButtonInteraction } from 'discord.js';

import { type NmDayNameType } from '../../model';
import { GetDebug, type GuildServiceModel } from '../../utility';

const dbg = GetDebug('VolunteerEvent');
// todo: split this into different events for clarity

export async function VolunteerDistroDeleteButtonEvent(
    { nightDataService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-distro-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    // todo: actually implement this
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

import { type ButtonInteraction } from 'discord.js';

import { type NmDayNameType } from '../../model';
import { GetDebug, type GuildServiceModel } from '../../utility';

const dbg = GetDebug('VolunteerEvent');

export async function VolunteerPickupDeleteButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-pickup-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    // todo: make sure we are only sending addList for this discordId and day?

    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, []);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

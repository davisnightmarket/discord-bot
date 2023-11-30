import {
    type ButtonInteraction,
    type StringSelectMenuInteraction,
    type ChatInputCommandInteraction
} from 'discord.js';

import { type NmDayNameType } from '../../model';
import { Dbg, type GuildServiceModel } from '../../utility';

const dbg = Dbg('VolunteerEvent');

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

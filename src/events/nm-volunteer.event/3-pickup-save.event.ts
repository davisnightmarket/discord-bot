import { type StringSelectMenuInteraction } from 'discord.js';

import { type NmDayNameType } from '../../model';
import { GetDebug, type GuildServiceModel } from '../../utility';

const dbg = GetDebug('VolunteerEvent');

// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
export async function VolunteerPickupSaveSelectEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-pickup-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    const addList = nightDataService.getNightOpsDiscordSelectValues(
        interaction.values,
        {
            day,
            role: 'night-pickup',
            discordIdOrEmail: discordId,
            periodStatus: 'ALWAYS'
        }
    );
    dbg(`Adding ${addList.length} records`);
    await nightDataService.replacePickupsForOnePersonAndDay(
        day,
        discordId,
        addList
    );

    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });

    // succcess!
    await interaction.editReply({
        content:
            'OK, all set!\n' + markdownService.getMyPickups(discordId, nightMap)
    });
}

import { type StringSelectMenuInteraction } from 'discord.js';

import { type NmDayNameType } from '../../model';
import { GetDebug, type GuildServiceModel } from '../../utility';

const dbg = GetDebug('VolunteerEvent');

// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
export async function VolunteerDistroSaveSelectEvent(
    { nightDataService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType]
) {
    if (command !== 'volunteer-distro-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // const nightMap = await nightDataService.getNightMapByDay(day, {
    //     refreshCache: true
    // });

    // todo: fix this since we now have the capacity for multiple markets per day

    const addList = nightDataService.getNightOpsDiscordSelectValues(
        interaction.values,
        {
            day,
            role: 'night-distro',
            discordIdOrEmail: discordId,
            periodStatus: 'ALWAYS'
        }
    );
    await nightDataService.addHostForOnePersonAndDay(day, discordId, addList);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

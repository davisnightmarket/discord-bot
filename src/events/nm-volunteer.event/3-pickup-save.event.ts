import {
    type ButtonInteraction,
    type StringSelectMenuInteraction,
    type ChatInputCommandInteraction
} from 'discord.js';

import { type NmDayNameType, type NmNightRoleType } from '../../model';
import {
    GetVolunteerDistroComponent,
    GetVolunteerInitComponent,
    GetVolunteerPickupComponent
} from '../../component/volunteer.component';
import {
    Dbg,
    GetChannelDayNameFromInteraction,
    GetChannelDayToday,
    type GuildServiceModel
} from '../../utility';

import { type PeriodStatusType } from '../../service';

const dbg = Dbg('VolunteerEvent');

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

    const addList = nightDataService.getNightDataDiscordSelectValues(
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

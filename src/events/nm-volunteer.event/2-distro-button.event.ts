import { type ButtonInteraction } from 'discord.js';

import { type NmDayNameType, type NmNightRoleType } from '../../model';
import { GetVolunteerDistroComponent } from '../../component/volunteer.component';
import { Dbg, type GuildServiceModel } from '../../utility';

import { type PeriodStatusType } from '../../service';

const dbg = Dbg('VolunteerDistroButtonEvent');

export async function VolunteerDistroButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, NmNightRoleType, string]
) {
    if (command !== 'volunteer-distro') {
        return;
    }

    dbg('volunteer-distro', [command, day, discordId]);

    interaction.deferReply({ ephemeral: true });

    const nightMap = await nightDataService.getNightMapByDay(day);
    const { marketList } = nightMap;
    if (!marketList.length) {
        await interaction.editReply({
            content: `No hosting available on ${day}. Choose another day:`
            // todo: add day select button
        });
    } else if (marketList.length === 1) {
        const { orgPickup, orgMarket, timeStart, timeEnd } = marketList[0];

        const addList = [
            {
                day,
                role: 'night-distro' as NmNightRoleType,
                discordIdOrEmail: discordId,
                periodStatus: 'ALWAYS' as PeriodStatusType,
                orgPickup,
                orgMarket,
                timeStart,
                timeEnd
            }
        ];

        await nightDataService.addHostForOnePersonAndDay(
            day,
            discordId,
            addList
        );
        await interaction.editReply({
            content: `OK all set!`
            // todo: add day select button
        });
    } else {
        const components = GetVolunteerDistroComponent(
            {
                day,
                discordId
            },
            marketList
        );
        interaction.editReply({
            content: `Replace distro:\n ${markdownService.getMyDistros(
                discordId,
                nightMap
            )} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
    }
}

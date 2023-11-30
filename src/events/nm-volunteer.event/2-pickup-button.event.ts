import { type ButtonInteraction } from 'discord.js';

import { type NmDayNameType, type NmNightRoleType } from '../../model';
import { GetVolunteerPickupComponent } from '../../component/volunteer.component';
import { Dbg, type GuildServiceModel } from '../../utility';

const dbg = Dbg('VolunteerPickupButtonEvent');

// when they hit the pickup button, the editing begins
export async function VolunteerPickupButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, NmNightRoleType, string]
) {
    if (command !== 'volunteer-pickup') {
        return;
    }

    dbg('volunteer-pickup', [command, day, discordId]);

    interaction.deferReply({ ephemeral: true });

    const nightMap = await nightDataService.getNightMapByDay(day);
    const pickupList = [...nightMap.marketList.map((a) => a.pickupList)].flat();
    if (pickupList.length) {
        const components = GetVolunteerPickupComponent(
            {
                day,
                discordId
            },
            pickupList
        );
        interaction.editReply({
            content: `Replace pick-ups:\n ${markdownService.getMyPickups(
                discordId,
                nightMap
            )} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
        return;
    }

    await interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });
}

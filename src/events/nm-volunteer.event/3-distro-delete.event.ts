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

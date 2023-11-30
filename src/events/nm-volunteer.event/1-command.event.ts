import { type ChatInputCommandInteraction } from 'discord.js';

import { GetVolunteerInitComponent } from '../../component/volunteer.component';
import {
    Dbg,
    GetChannelDayNameFromInteraction,
    GetChannelDayToday,
    type GuildServiceModel
} from '../../utility';

const dbg = Dbg('VolunteerEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
export async function VolunteerCommandEvent(
    { nightDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    // get the channel day or otherwise the current day
    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ??
        GetChannelDayToday();

    // get
    dbg(day);

    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });
    // TODO: some logic here to figure out:
    // check their history to see if they
    // need to shadow -- this can be done with NightPerson Status in night data

    await interaction.editReply({
        content: markdownService.getNightMapEphemeral(discordId, nightMap),

        components: GetVolunteerInitComponent({
            day,
            discordId
        })
    });
}

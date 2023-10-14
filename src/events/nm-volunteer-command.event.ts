import { type ChatInputCommandInteraction } from 'discord.js';
import { GetChannelDayNameFromInteraction } from '../utility';
import { type GuildServiceModel } from '../model';

// todo: split this into different events for clarity
// when a person requests a listing of
export async function VolunteerCommandEvent(
    { processEventService, discordReplyService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    // get our content and component datas
    const [contentData, componentData] =
        await processEventService.getVolunteerListContent(
            await GetChannelDayNameFromInteraction(interaction)
        );

    // get our actual content and components
    const { content, components } =
        discordReplyService.getNmVolunteerListEventReply(
            interaction.user.id,
            contentData,
            componentData
        );
    // send it back!
    interaction.editReply({
        content,
        components
    });
}

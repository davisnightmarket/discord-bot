import {
    type Guild,
    type ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    Interaction,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder
} from 'discord.js';

import { GetChannelDayToday, GetPickupJoinMessage } from '../utility';
import {
    type NmDayNameType,
    type GuildServiceModel,
    NmNightRoleType,
    NmRolePeriodType
} from '../model';
import { DAYS_OF_WEEK_CODES, NM_NIGHT_ROLES } from '../const';

// todo: split this into different events for clarity
// when a person requests a listing of
export async function VolunteerRequestEvent(
    { nightDataService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    // todo: we need to organize button commands as we have slash commands
    if (!interaction.isCommand()) {
        return;
    }

    const guild = interaction.guild as Guild;

    interaction = interaction as ChatInputCommandInteraction;
    interaction.deferReply();
    let channelDay = (
        await guild?.channels?.fetch(interaction?.channelId ?? '')
    )?.name as NmDayNameType;
    channelDay = DAYS_OF_WEEK_CODES.includes(channelDay)
        ? channelDay
        : GetChannelDayToday();

    const { pickupList } = await nightDataService.getNightByDay(channelDay);

    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    const content = GetPickupJoinMessage(pickupList);

    const joinOnceButton = new ButtonBuilder()
        .setCustomId(`volunteer--${channelDay}--night-host`)
        .setLabel(NM_NIGHT_ROLES['night-host'].description)
        .setStyle(ButtonStyle.Secondary);
    const joinAlwaysButton = new ButtonBuilder()
        .setCustomId(`volunteer--${channelDay}--night-pickup`)
        .setLabel(NM_NIGHT_ROLES['night-pickup'].description)
        .setStyle(ButtonStyle.Secondary);

    components.push(
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton)
    );
    interaction.editReply({
        content,
        components
    });
}

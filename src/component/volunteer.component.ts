import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { NightModel, NightPersonModel, PersonModel } from '../service';
import { NM_NIGHT_ROLES } from '../const';

export function GetVolunteerPeriodComponent({ day, role }: NightPersonModel) {
    const joinOnceButton = new ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--once`)
        .setLabel(`${NM_NIGHT_ROLES[role].name} just this ${day}`)
        .setStyle(ButtonStyle.Secondary);
    const joinAlwaysButton = new ButtonBuilder()
        .setCustomId(`volunteer--${day}--${role}--every`)
        .setLabel(`${NM_NIGHT_ROLES[role].name}  every ${day}`)
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton)
    ];
}

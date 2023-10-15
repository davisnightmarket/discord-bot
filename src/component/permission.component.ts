import {
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { PERMISSION_CODE_LIST, PERMISSION_MAP, PermissionType } from '../const';

export const PermissionStartComponent = (discordId: string) => {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`permission--start--${discordId}`)
                .setLabel('Edit permissions?')
                .setStyle(ButtonStyle.Secondary)
        )
    ];
};

export const PermissionToSelectComponent = (discordId: string) => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`permission--edit--${discordId}`)

                .setMinValues(0)
                .setMaxValues(PERMISSION_CODE_LIST.length)
                .addOptions(
                    ...PERMISSION_CODE_LIST.map((code) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(
                                PERMISSION_MAP[code as PermissionType].name
                            )
                            .setDescription(
                                PERMISSION_MAP[code as PermissionType]
                                    .description
                            )
                            .setValue(`contact-text---${code}`);
                    })
                )
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`permission--revoke--${discordId}`)
                .setLabel('REVOKE ALL')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`permission--grant-all--${discordId}`)
                .setLabel('GRANT ALL')
                .setStyle(ButtonStyle.Secondary)
        )
    ];
};

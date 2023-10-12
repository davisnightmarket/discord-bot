import {
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import {
    PERMISSION_TO_CONTACT_EMAIL_LIST,
    PERMISSION_TO_CONTACT_EMAIL_MAP,
    PERMISSION_TO_CONTACT_TEXT_LIST,
    PERMISSION_TO_CONTACT_TEXT_MAP,
    PERMISSION_TO_SHARE_EMAIL_LIST,
    PERMISSION_TO_SHARE_EMAIL_MAP,
    PERMISSION_TO_SHARE_PHONE_LIST,
    PERMISSION_TO_SHARE_PHONE_MAP,
    PermissionToContactEmailType,
    PermissionToContactTextType,
    PermissionToSharePhoneType,
    PermissionToShareEmailType
} from '../const';

export const PermissionStartComponent = () => {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`permission--start`)
                .setLabel('Edit permiission?')
                .setStyle(ButtonStyle.Secondary)
        )
    ];
};

export const PermissionToSelectComponent = () => {
    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`permission--contact-text-on`)

                .setMinValues(0)
                .setMaxValues(PERMISSION_TO_CONTACT_EMAIL_LIST.length)
                .addOptions(
                    ...PERMISSION_TO_CONTACT_EMAIL_LIST.map((code) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(
                                PERMISSION_TO_CONTACT_EMAIL_MAP[
                                    code as PermissionToContactEmailType
                                ].name
                            )
                            .setDescription(
                                PERMISSION_TO_CONTACT_EMAIL_MAP[
                                    code as PermissionToContactEmailType
                                ].description
                            )
                            .setValue(code);
                    })
                )
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`permission--contact-email-on`)

                .setMinValues(0)
                .setMaxValues(PERMISSION_TO_CONTACT_TEXT_LIST.length)
                .addOptions(
                    ...PERMISSION_TO_CONTACT_TEXT_LIST.map((code) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(
                                PERMISSION_TO_CONTACT_TEXT_MAP[
                                    code as PermissionToContactTextType
                                ].name
                            )
                            .setDescription(
                                PERMISSION_TO_CONTACT_TEXT_MAP[
                                    code as PermissionToContactTextType
                                ].description
                            )
                            .setValue(code);
                    })
                )
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`permission--share-email-on`)

                .setMinValues(0)
                .setMaxValues(PERMISSION_TO_SHARE_PHONE_LIST.length)
                .addOptions(
                    ...PERMISSION_TO_SHARE_PHONE_LIST.map((code) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(
                                PERMISSION_TO_SHARE_PHONE_MAP[
                                    code as PermissionToSharePhoneType
                                ].name
                            )
                            .setDescription(
                                PERMISSION_TO_SHARE_PHONE_MAP[
                                    code as PermissionToSharePhoneType
                                ].description
                            )
                            .setValue(code);
                    })
                )
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`permission--share-phone-on`)
                .setMinValues(0)
                .setMaxValues(PERMISSION_TO_SHARE_EMAIL_LIST.length)
                .addOptions(
                    ...PERMISSION_TO_SHARE_EMAIL_LIST.map((code) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(
                                PERMISSION_TO_SHARE_EMAIL_MAP[
                                    code as PermissionToShareEmailType
                                ].name
                            )
                            .setDescription(
                                PERMISSION_TO_SHARE_EMAIL_MAP[
                                    code as PermissionToShareEmailType
                                ].description
                            )
                            .setValue(code);
                    })
                )
        )
    ];
};

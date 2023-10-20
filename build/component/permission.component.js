"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionToSelectComponent = exports.PermissionStartComponent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
const PermissionStartComponent = () => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`permission--start`)
            .setLabel('Edit permiission?')
            .setStyle(discord_js_1.ButtonStyle.Secondary))
    ];
};
exports.PermissionStartComponent = PermissionStartComponent;
const PermissionToSelectComponent = () => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`permission--edit`)
            .setMinValues(0)
            .setMaxValues(const_1.PERMISSION_TO_CONTACT_TEXT_LIST.length +
            const_1.PERMISSION_TO_SHARE_PHONE_LIST.length +
            const_1.PERMISSION_TO_CONTACT_EMAIL_LIST.length +
            const_1.PERMISSION_TO_SHARE_EMAIL_LIST.length)
            .addOptions(...const_1.PERMISSION_TO_CONTACT_TEXT_LIST.map((code) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(const_1.PERMISSION_TO_CONTACT_TEXT_MAP[code].name)
                .setDescription(const_1.PERMISSION_TO_CONTACT_TEXT_MAP[code].description)
                .setValue(`contact-text---${code}`);
        }), ...const_1.PERMISSION_TO_SHARE_PHONE_LIST.map((code) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(const_1.PERMISSION_TO_SHARE_PHONE_MAP[code].name)
                .setDescription(const_1.PERMISSION_TO_SHARE_PHONE_MAP[code].description)
                .setValue(`share-phone---${code}`);
        }), ...const_1.PERMISSION_TO_CONTACT_EMAIL_LIST.map((code) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(const_1.PERMISSION_TO_CONTACT_EMAIL_MAP[code].name)
                .setDescription(const_1.PERMISSION_TO_CONTACT_EMAIL_MAP[code].description)
                .setValue(`contact-email---${code}`);
        }), ...const_1.PERMISSION_TO_SHARE_EMAIL_LIST.map((code) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(const_1.PERMISSION_TO_SHARE_EMAIL_MAP[code].name)
                .setDescription(const_1.PERMISSION_TO_SHARE_EMAIL_MAP[code].description)
                .setValue(`share-email---${code}`);
        })))
    ];
};
exports.PermissionToSelectComponent = PermissionToSelectComponent;

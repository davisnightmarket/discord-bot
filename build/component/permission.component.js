"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionToSelectComponent = exports.PermissionStartComponent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
const PermissionStartComponent = (discordId) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`permission--start--${discordId}`)
            .setLabel('Edit permissions?')
            .setStyle(discord_js_1.ButtonStyle.Secondary))
    ];
};
exports.PermissionStartComponent = PermissionStartComponent;
const PermissionToSelectComponent = (discordId) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`permission--edit--${discordId}`)
            .setMinValues(0)
            .setMaxValues(const_1.PERMISSION_CODE_LIST.length)
            .addOptions(...const_1.PERMISSION_CODE_LIST.map((code) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(const_1.PERMISSION_MAP[code].name)
                .setDescription(const_1.PERMISSION_MAP[code]
                .description)
                .setValue(`contact-text---${code}`);
        }))),
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`permission--revoke--${discordId}`)
            .setLabel('REVOKE ALL')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId(`permission--grant-all--${discordId}`)
            .setLabel('GRANT ALL')
            .setStyle(discord_js_1.ButtonStyle.Secondary))
    ];
};
exports.PermissionToSelectComponent = PermissionToSelectComponent;

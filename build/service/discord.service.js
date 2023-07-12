"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelByName = void 0;
const discord_js_1 = require("discord.js");
function getChannelByName(guild, name) {
    return guild === null || guild === void 0 ? void 0 : guild.channels.cache.find((c) => c.type === discord_js_1.ChannelType.GuildText && c.name === name.toLowerCase());
}
exports.getChannelByName = getChannelByName;

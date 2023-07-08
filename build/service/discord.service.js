"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelByName = void 0;
const discord_js_1 = require("discord.js");
function getChannelByName(client, name) {
    var _a;
    return (_a = client.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.find((c) => c.type === discord_js_1.ChannelType.GuildText && c.name === name.toLowerCase());
}
exports.getChannelByName = getChannelByName;

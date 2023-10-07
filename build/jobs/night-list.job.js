"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightListJob = void 0;
const utility_1 = require("../utility");
// when a person requests a listing of
const NightListJob = (client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);
    for (const guild of guildList) {
        // get the guild service
        const { nightDataService } = await (0, utility_1.GetGuildServices)(guild.id);
        // get the channel by today name
        const channelDay = (0, utility_1.GetChannelDayToday)();
        const content = (0, utility_1.GetAnnounceMessage)(await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay), await nightDataService.getNightByDay(channelDay));
        (await guild.channels.cache.find((channel) => channel.name === channelDay))?.send({
            content
        });
    }
};
exports.NightListJob = NightListJob;

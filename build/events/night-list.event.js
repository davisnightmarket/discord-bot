"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightListEvent = void 0;
const utility_1 = require("../utility");
// when a person requests a listing of
const NightListEvent = (client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);
    for (const guild of guildList) {
        // get the guild service
        const { nightDataService } = await (0, utility_1.GetGuildServices)(guild.id);
        // get the channel by today name
        const channelDay = (0, utility_1.GetChannelDayToday)();
        // get night ops
        const { pickupsList } = await nightDataService.getNightByDay(channelDay);
        const roleId = await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay);
        // create message
        const content = (0, utility_1.GetOpsAnnounceMessage)(roleId, pickupsList);
        (await guild.channels.fetch(channelDay))?.send({
            content
        });
    }
};
exports.NightListEvent = NightListEvent;

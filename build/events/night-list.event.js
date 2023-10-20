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
        console.log(channelDay);
        // get night ops
        const nightMap = await nightDataService.getNightByDay(channelDay);
        const roleId = await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay);
        // create message
        const content = (0, utility_1.GetNightCapMessage)(nightMap) +
            '\n\n' +
            (0, utility_1.GetHostMessage)(roleId, nightMap) +
            '\n\n' +
            (0, utility_1.GetPickupsMessage)(roleId, nightMap);
        console.log(content);
        (await guild.channels.cache.find((channel) => channel.name === channelDay))?.send({
            content
        });
    }
};
exports.NightListEvent = NightListEvent;

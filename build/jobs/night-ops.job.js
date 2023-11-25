"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightOpsJob = void 0;
const utility_1 = require("../utility");
const dbg = (0, utility_1.DebugUtility)('NightOpsJob');
// when a person requests a listing of
const NightOpsJob = (client) => async () => {
    // get the guild
    const guildList = client.guilds.cache.map((guild) => guild);
    for (const guild of guildList) {
        // get the guild service
        const { nightDataService, markdownService } = await (0, utility_1.GetGuildServices)(guild.id);
        // get the channel by today name
        const channelDay = (0, utility_1.GetChannelDayToday)();
        const nightMap = await nightDataService.getNightMapByDay(channelDay);
        dbg(channelDay);
        dbg(nightMap);
        const pickupList = [
            ...nightMap.marketList.map((a) => a.pickupList)
        ].flat();
        const hostList = [...nightMap.marketList.map((a) => a.hostList)].flat();
        let content = '';
        if (pickupList.length === 0 && hostList.length === 0) {
            dbg('No pickups or hosting scheduled.');
            content = 'No pickups or hosting scheduled.';
        }
        else {
            content = markdownService.getNightMapAnnounce(await (0, utility_1.GetGuildRoleIdByName)(guild, channelDay), nightMap);
        }
        guild.channels.cache.find((channel) => channel.name === channelDay)?.send({
            content
        });
    }
};
exports.NightOpsJob = NightOpsJob;

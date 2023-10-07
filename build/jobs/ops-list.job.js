"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpsListJob = void 0;
const utility_1 = require("../utility");
// sends a list of operations to a guild channel with the same day name as today
async function OpsListJob({ nightDataService }, guild) {
    const day = (0, utility_1.GetChannelDayToday)();
    const { pickupList };
    const content = (0, utility_1.GetPickupsMessage)(await (0, utility_1.GetGuildRoleIdByName)(guild, day), await nightDataService.getNightByDay(day));
    const channel = (0, utility_1.GetChannelByName)(day, guild);
    channel?.send(content);
}
exports.OpsListJob = OpsListJob;

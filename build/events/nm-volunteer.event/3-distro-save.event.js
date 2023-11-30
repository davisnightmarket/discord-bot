"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerDistroSaveSelectEvent = void 0;
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerEvent');
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
async function VolunteerDistroSaveSelectEvent({ nightDataService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-distro-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // const nightMap = await nightDataService.getNightMapByDay(day, {
    //     refreshCache: true
    // });
    // todo: fix this since we now have the capacity for multiple markets per day
    const addList = nightDataService.getNightDataDiscordSelectValues(interaction.values, {
        day,
        role: 'night-distro',
        discordIdOrEmail: discordId,
        periodStatus: 'ALWAYS'
    });
    await nightDataService.addHostForOnePersonAndDay(day, discordId, addList);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerDistroSaveSelectEvent = VolunteerDistroSaveSelectEvent;

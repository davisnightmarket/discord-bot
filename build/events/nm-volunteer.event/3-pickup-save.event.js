"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerPickupSaveSelectEvent = void 0;
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerEvent');
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
async function VolunteerPickupSaveSelectEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    const addList = nightDataService.getNightDataDiscordSelectValues(interaction.values, {
        day,
        role: 'night-pickup',
        discordIdOrEmail: discordId,
        periodStatus: 'ALWAYS'
    });
    dbg(`Adding ${addList.length} records`);
    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, addList);
    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!\n' + markdownService.getMyPickups(discordId, nightMap)
    });
}
exports.VolunteerPickupSaveSelectEvent = VolunteerPickupSaveSelectEvent;

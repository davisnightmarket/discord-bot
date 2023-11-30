"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerPickupDeleteButtonEvent = void 0;
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerEvent');
async function VolunteerPickupDeleteButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // todo: make sure we are only sending addList for this discordId and day?
    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, []);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerPickupDeleteButtonEvent = VolunteerPickupDeleteButtonEvent;

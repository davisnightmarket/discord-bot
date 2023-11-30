"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerDistroDeleteButtonEvent = void 0;
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerEvent');
// todo: split this into different events for clarity
async function VolunteerDistroDeleteButtonEvent({ nightDataService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-distro-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // todo: actually implement this
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerDistroDeleteButtonEvent = VolunteerDistroDeleteButtonEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerDaySelectEvent = void 0;
const volunteer_component_1 = require("../../component/volunteer.component");
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerDaySelectEvent');
// when they hit the pickup button, the editing begins
async function VolunteerDaySelectEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-list-day') {
        return;
    }
    dbg('volunteer-pickup', [command, day, discordId]);
    interaction.deferReply({ ephemeral: true });
    const components = (0, volunteer_component_1.GetVolunteerRoleComponent)({
        day,
        discordId
    });
    interaction.editReply({
        content: `Choose your day`,
        components
    });
}
exports.VolunteerDaySelectEvent = VolunteerDaySelectEvent;

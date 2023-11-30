"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerPickupButtonEvent = void 0;
const volunteer_component_1 = require("../../component/volunteer.component");
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerPickupButtonEvent');
// when they hit the pickup button, the editing begins
async function VolunteerPickupButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup') {
        return;
    }
    dbg('volunteer-pickup', [command, day, discordId]);
    interaction.deferReply({ ephemeral: true });
    const nightMap = await nightDataService.getNightMapByDay(day);
    const pickupList = [...nightMap.marketList.map((a) => a.pickupList)].flat();
    if (pickupList.length) {
        const components = (0, volunteer_component_1.GetVolunteerPickupComponent)({
            day,
            discordId
        }, pickupList);
        interaction.editReply({
            content: `Replace pick-ups:\n ${markdownService.getMyPickups(discordId, nightMap)} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
        return;
    }
    await interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });
}
exports.VolunteerPickupButtonEvent = VolunteerPickupButtonEvent;

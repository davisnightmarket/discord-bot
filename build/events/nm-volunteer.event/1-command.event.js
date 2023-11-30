"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerCommandEvent = void 0;
const volunteer_component_1 = require("../../component/volunteer.component");
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
async function VolunteerCommandEvent({ nightDataService, markdownService }, interaction, discordId) {
    // get the channel day or otherwise the current day
    const day = (await (0, utility_1.GetChannelDayNameFromInteraction)(interaction)) ??
        (0, utility_1.GetChannelDayToday)();
    // get
    dbg(day);
    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });
    // TODO: some logic here to figure out:
    // check their history to see if they
    // need to shadow -- this can be done with NightPerson Status in night data
    await interaction.editReply({
        content: markdownService.getNightMapEphemeral(discordId, nightMap),
        components: (0, volunteer_component_1.GetVolunteerInitComponent)({
            day,
            discordId
        })
    });
}
exports.VolunteerCommandEvent = VolunteerCommandEvent;

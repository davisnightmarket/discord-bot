"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityCommandEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('AvailabilityCommandEvent');
async function AvailabilityCommandEvent({ personDataService, markdownService }, interaction) {
    dbg('ok');
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        // show them their modal
        interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const [availabilityHostList, availabilityPickupList] = markdownService.getAvailabilityListsFromPerson(person);
    const components = (0, component_1.AvailabilityEditButtonComponent)();
    const content = markdownService.md.AVAILABILITY_LIST({
        availabilityHostList,
        availabilityPickupList
    });
    // response
    interaction.editReply({
        content,
        components
    });
}
exports.AvailabilityCommandEvent = AvailabilityCommandEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditAvailabilityEvent = void 0;
const component_1 = require("../component");
// in which user edits their availability
async function IdentityEditAvailabilityEvent({ personDataService }, interaction) {
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    console.log(person, 'PERS', interaction.user.id);
    if (!person) {
        // show them their modal
        interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
        return;
    }
    // todo: show host then pickup, since we can't fit them all
    const components = (0, component_1.AvailabilityHostComponent)(personDataService.createPerson(person));
    // response
    interaction.reply({
        content: 'Which days and times are you available to host and/or pickup and deliver to Night Market?\n You can select multiple days and times.',
        components
    });
}
exports.IdentityEditAvailabilityEvent = IdentityEditAvailabilityEvent;

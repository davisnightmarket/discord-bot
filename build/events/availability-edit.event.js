"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditAvailabilityEvent = void 0;
const component_1 = require("../component");
const const_1 = require("../const");
const service_1 = require("../service");
// in which user edits their availability
async function IdentityEditAvailabilityEvent({ personDataService, nightDataService }, interaction) {
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        // show them their modal
        interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
        return;
    }
    await interaction.deferReply();
    const dayTimes = await nightDataService.waitingForNightCache.then((nightOps) => {
        const dayTimesMap = nightOps.reduce((a, b) => {
            if (b.day && b.timeStart && !a[b.day + b.timeStart]) {
                a[b.day + b.timeStart] = [
                    `${b.day}||${b.timeStart}`,
                    `${const_1.DAYS_OF_WEEK[b.day].name} ${service_1.ParseContentService.getAmPmTimeFrom24Hour(b.timeStart)}`
                ];
            }
            return a;
        }, {});
        return Object.values(dayTimesMap);
    });
    // todo: show host then pickup, since we can't fit them all
    const components = (0, component_1.AvailabilityHostComponent)(dayTimes, personDataService.createPerson(person));
    // response
    interaction.editReply({
        content: 'Which days and times are you available to host Night Market?\n You can select multiple days and times.',
        components
    });
}
exports.IdentityEditAvailabilityEvent = IdentityEditAvailabilityEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityCommandEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
const const_1 = require("../const");
const service_1 = require("../service");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('AvailabilityCommandEvent');
async function AvailabilityCommandEvent({ personDataService, nightDataService, messageService }, interaction) {
    dbg('ok');
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        // show them their modal
        interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
        return;
    }
    // todo: mover to person service
    const availabilityHostList = person.availabilityHost
        .split(',')
        .map((a) => a
        .trim()
        .split('|||')
        .map((a) => a.trim()))
        .map((a) => `${const_1.DAYS_OF_WEEK[a[0]].name} ${service_1.ParseContentService.getAmPmTimeFrom24Hour(a[1])}`);
    const availabilityPickupList = person.availabilityPickup
        .split(',')
        .map((a) => a
        .trim()
        .split('|||')
        .map((a) => a.trim()))
        .map((a) => `${const_1.DAYS_OF_WEEK[a[0]].name} ${const_1.PARTS_OF_DAY[a[1]].name}`);
    console.log(person.availabilityHost.split(',').map((a) => a
        .trim()
        .split('|||')
        .map((a) => a.trim())));
    console.log(person.availabilityPickup.split(',').map((a) => a
        .trim()
        .split('|||')
        .map((a) => a.trim())));
    await interaction.deferReply();
    // todo: show host then pickup, since we can't fit them all
    const components = (0, component_1.AvailabilityEditButtonComponent)();
    const content = messageService.m.AVAILABILITY_LIST({
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

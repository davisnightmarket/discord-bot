"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityEditSelectEvent = exports.AvailabilityEditButtonEvent = exports.AvailabilityCommandEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
const component_2 = require("../component");
const const_1 = require("../const");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('AvailabilityEvent');
async function AvailabilityCommandEvent({ personDataService, markdownService }, interaction, discordId) {
    dbg('ok');
    await interaction.deferReply({ ephemeral: true });
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        // show them their modal
        await interaction.editReply(await markdownService.getGenericSorry());
        return;
    }
    const [availabilityHostList, availabilityPickupList] = markdownService.getAvailabilityListsFromPerson(person);
    const components = (0, component_1.AvailabilityEditButtonComponent)(discordId);
    const content = [
        markdownService.md.AVAILABILITY_LIST({
            availabilityHostList,
            availabilityPickupList
        })
    ].join('\n') + '\n';
    await interaction.editReply({
        content,
        components
    });
}
exports.AvailabilityCommandEvent = AvailabilityCommandEvent;
// in which user edits their availability
async function AvailabilityEditButtonEvent({ personDataService, nightDataService, markdownService }, interaction, discordId, [command, step, day]) {
    // todo: handle this higher up
    if (command !== 'availability') {
        return;
    }
    dbg(command, step, day);
    await interaction.deferReply({ ephemeral: true });
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        //! we would like to show them their modal
        // // we cannot show the identity model since we have deferred
        await interaction.editReply(await markdownService.getGenericNoPerson());
        // interaction.showModal(
        //     IdentityEditModalComponent(personDataService.createPerson(person))
        // );
        return;
    }
    if (step === 'init') {
        // if (!person) {
        //     // show them their modal
        //     interaction.showModal(
        //         IdentityEditModalComponent(
        //             personDataService.createPerson(person)
        //         )
        //     );
        //     return;
        // }
        const dayTimes = await nightDataService.getDayTimeIdAndReadableByDayAsTupleList();
        // todo: show host then pickup, since we can't fit them all
        const components = (0, component_2.AvailabilityToHostComponent)(dayTimes, discordId, []);
        // response
        await interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_HOST({}),
            components
        });
    }
}
exports.AvailabilityEditButtonEvent = AvailabilityEditButtonEvent;
// in which user edits their availability
async function AvailabilityEditSelectEvent({ personDataService, markdownService }, interaction, discordId, [command, step, day]) {
    // todo: handle this higher up
    if (command !== 'availability') {
        return;
    }
    dbg(command, step, day);
    await interaction.deferReply({ ephemeral: true });
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        //! we would like to show them their modal
        // // we cannot show the identity model since we have deferred
        await interaction.editReply(await markdownService.getGenericNoPerson());
        // interaction.showModal(
        //     IdentityEditModalComponent(personDataService.createPerson(person))
        // );
        return;
    }
    const daysOfWeekIdList = Object.values(const_1.DAYS_OF_WEEK).map((a) => a.id);
    // in this case we have selected our night-host availability so ...
    if (step === 'night-host') {
        // save it to the db ...
        // const [day, timeStart] = interaction.values[0].split('|||');
        // dbg(day, timeStart);
        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityHost: interaction.values.join(',')
        });
        // now display first night-pickup select
        const currentDay = const_1.DAYS_OF_WEEK[daysOfWeekIdList[0]];
        const components = (0, component_2.AvailabilityToPickupPerDayComponent)({
            day: currentDay.id,
            discordId,
            defaultList: []
        });
        await interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),
            components
        });
        return;
    }
    // in this case we are in the pickup section
    if (step === 'night-pickup') {
        // save the previous to the db ...
        // if we are on the first day, reset
        let availabilityPickup = '';
        if (!daysOfWeekIdList.indexOf(day)) {
            availabilityPickup = interaction.values.join(',');
        }
        else {
            availabilityPickup += interaction.values.join(',');
        }
        personDataService.updatePersonByDiscordId({
            ...person,
            availabilityPickup
        });
        // show the next step
        const nextDayIndex = daysOfWeekIdList.indexOf(day) + 1;
        // in this case we are done with the pickups, want to show permissions
        if (nextDayIndex === daysOfWeekIdList.length) {
            await interaction.editReply({
                content: markdownService.md.GENERIC_OK({})
            });
            return;
        }
        const currentDay = Object.values(const_1.DAYS_OF_WEEK)[nextDayIndex];
        // todo: show host then pickup, since we can't fit them all
        const components = (0, component_2.AvailabilityToPickupPerDayComponent)({
            day: currentDay.id,
            discordId,
            defaultList: []
        });
        // response
        await interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),
            components
        });
    }
}
exports.AvailabilityEditSelectEvent = AvailabilityEditSelectEvent;

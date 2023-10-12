"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityEditButtonEvent = void 0;
const component_1 = require("../component");
const const_1 = require("../const");
const utility_1 = require("../utility");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('AvailabilityEditButtonEvent');
async function AvailabilityEditButtonEvent({ personDataService, nightDataService, markdownService }, interaction, args) {
    const [command, step, day] = args.split('--');
    dbg(command, step, day);
    // todo: handle this higher up
    if (command !== 'availability') {
        return;
    }
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        //! we would like to show them their modal
        // // we cannot show the identity model since we have deferred
        // interaction.editReply({
        //     content: await markdownService.getGenericNoPerson()
        // });
        interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
        return;
    }
    await interaction.deferReply();
    if (step === 'night-list') {
        if (!person) {
            // show them their modal
            interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
            return;
        }
        const dayTimes = await nightDataService.getDayTimeIdAndReadableByDayAsTupleList();
        // todo: show host then pickup, since we can't fit them all
        const components = (0, component_1.AvailabilityToHostComponent)(dayTimes, personDataService.createPerson(person));
        // response
        interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_HOST({}),
            components
        });
    }
    const daysOfWeekIdList = Object.values(const_1.DAYS_OF_WEEK).map((a) => a.id);
    // todo: we probably should have a routing utility for routing different types of responses
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
        const components = (0, component_1.AvailabilityToPickupPerDayComponent)({
            day: currentDay.id
        });
        interaction.editReply({
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
            // todo get these and build them
            const contactTextOnList = '', contactEmailOnList = '', sharePhoneOnList = '', shareEmailOnList = '';
            interaction.editReply({
                content: markdownService.md.PERMISSION_LIST({
                    contactTextOnList,
                    contactEmailOnList,
                    sharePhoneOnList,
                    shareEmailOnList
                }),
                components: (0, component_1.PermissionStartComponent)()
            });
            return;
        }
        const currentDay = Object.values(const_1.DAYS_OF_WEEK)[nextDayIndex];
        // todo: show host then pickup, since we can't fit them all
        const components = (0, component_1.AvailabilityToPickupPerDayComponent)({
            day: currentDay.id
        });
        // response
        interaction.editReply({
            content: markdownService.md.AVAILABILITY_TO_PICKUP({
                dayName: currentDay.name
            }),
            components
        });
    }
}
exports.AvailabilityEditButtonEvent = AvailabilityEditButtonEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerDistroSaveSelectEvent = exports.VolunteerPickupDeleteButtonEvent = exports.VolunteerPickupSaveSelectEvent = exports.VolunteerDistroButtonEvent = exports.VolunteerPickupButtonEvent = exports.VolunteerCommandEvent = void 0;
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
async function VolunteerDistroButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-distro') {
        return;
    }
    dbg('volunteer-distro', [command, day, discordId]);
    interaction.deferReply({ ephemeral: true });
    const nightMap = await nightDataService.getNightMapByDay(day);
    const { marketList } = nightMap;
    if (!marketList.length) {
        await interaction.editReply({
            content: `No hosting available on ${day}. Choose another day:`
            // todo: add day select button
        });
    }
    else if (marketList.length === 1) {
        const { orgPickup, orgMarket, timeStart, timeEnd } = marketList[0];
        const addList = [
            {
                day,
                role: 'night-distro',
                discordIdOrEmail: discordId,
                periodStatus: 'ALWAYS',
                orgPickup,
                orgMarket,
                timeStart,
                timeEnd
            }
        ];
        await nightDataService.addHostForOnePersonAndDay(day, discordId, addList);
        await interaction.editReply({
            content: `OK all set!`
            // todo: add day select button
        });
    }
    else {
        const components = (0, volunteer_component_1.GetVolunteerDistroComponent)({
            day,
            discordId
        }, marketList);
        interaction.editReply({
            content: `Replace distro:\n ${markdownService.getMyDistros(discordId, nightMap)} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
    }
}
exports.VolunteerDistroButtonEvent = VolunteerDistroButtonEvent;
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
async function VolunteerPickupSaveSelectEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    const addList = nightDataService.getNightDataDiscordSelectValues(interaction.values, {
        day,
        role: 'night-pickup',
        discordIdOrEmail: discordId,
        periodStatus: 'ALWAYS'
    });
    dbg(`Adding ${addList.length} records`);
    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, addList);
    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!\n' + markdownService.getMyPickups(discordId, nightMap)
    });
}
exports.VolunteerPickupSaveSelectEvent = VolunteerPickupSaveSelectEvent;
async function VolunteerPickupDeleteButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-pickup-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // todo: make sure we are only sending addList for this discordId and day?
    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, []);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerPickupDeleteButtonEvent = VolunteerPickupDeleteButtonEvent;
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
async function VolunteerDistroSaveSelectEvent({ nightDataService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-distro-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // const nightMap = await nightDataService.getNightMapByDay(day, {
    //     refreshCache: true
    // });
    // todo: fix this since we now have the capacity for multiple markets per day
    const addList = nightDataService.getNightDataDiscordSelectValues(interaction.values, {
        day,
        role: 'night-distro',
        discordIdOrEmail: discordId,
        periodStatus: 'ALWAYS'
    });
    await nightDataService.addHostForOnePersonAndDay(day, discordId, addList);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.VolunteerDistroSaveSelectEvent = VolunteerDistroSaveSelectEvent;

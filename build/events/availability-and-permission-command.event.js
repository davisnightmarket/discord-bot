"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityAndPermissionCommandEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
const const_1 = require("../const");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('AvailabilityCommandEvent');
async function AvailabilityAndPermissionCommandEvent({ personDataService, markdownService }, interaction) {
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
    const components = (0, component_1.AvailabilityAndPermissionEditButtonComponent)();
    // todo: move to markdown service
    console.log(person);
    const contactTextOnList = person.contactTextOn
        .split(',')
        .filter((a) => a)
        .map((a) => `  - ${const_1.PERMISSION_TO_CONTACT_TEXT_MAP[a].name}`)
        .join('\n') || '  - NO PERMISSIONS GRANTED', contactEmailOnList = person.contactEmailOn
        .split(',')
        .filter((a) => a)
        .map((a) => `  - ${const_1.PERMISSION_TO_CONTACT_EMAIL_MAP[a].name}`)
        .join('\n') || '  - NO PERMISSIONS GRANTED', sharePhoneOnList = person.sharePhoneOn
        .split(',')
        .filter((a) => a)
        .map((a) => `  - ${const_1.PERMISSION_TO_SHARE_PHONE_MAP[a].name}`)
        .join('\n') || '  - NO PERMISSIONS GRANTED', shareEmailOnList = person.shareEmailOn
        .split(',')
        .filter((a) => a)
        .map((a) => `  - ${const_1.PERMISSION_TO_SHARE_EMAIL_MAP[a].name}`)
        .join('\n') || '  - NO PERMISSIONS GRANTED';
    dbg(shareEmailOnList, contactTextOnList);
    const content = [
        markdownService.md.AVAILABILITY_LIST({
            availabilityHostList,
            availabilityPickupList
        }),
        markdownService.md.PERMISSION_LIST({
            contactTextOnList,
            contactEmailOnList,
            sharePhoneOnList,
            shareEmailOnList
        })
    ].join('\n') + '\n';
    // response
    interaction.editReply({
        content,
        components
    });
}
exports.AvailabilityAndPermissionCommandEvent = AvailabilityAndPermissionCommandEvent;

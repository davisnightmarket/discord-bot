"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionEditButtonEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('PermissionEditButtonEvent');
async function PermissionEditButtonEvent({ personDataService, nightDataService, markdownService }, interaction, args) {
    const [command, step, day] = args.split('--');
    dbg(command, step, day);
    // todo: handle this higher up
    if (command !== 'permission') {
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    if (step === 'start') {
        interaction.editReply({
            content: markdownService.md.PERMISSION_EDIT({}),
            components: (0, component_1.PermissionToSelectComponent)()
        });
        return;
    }
    if (step === 'edit') {
        const person = await personDataService.getPersonByDiscordId(interaction.user.id);
        if (!person) {
            //! we would like to show them their modal
            // // we cannot show the identity model since we have deferred
            // interaction.editReply({
            //     content: await markdownService.getGenericNoPerson()
            // });
            interaction.editReply(markdownService.md.GENERIC_SORRY({
                techPhone: ''
            }));
            return;
        }
        person.contactTextOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'contact-text')
            .map((a) => a[1])
            .join(',');
        person.sharePhoneOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'share-phone')
            .map((a) => a[1])
            .join(',');
        person.contactEmailOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'contact-email')
            .map((a) => a[1])
            .join(',');
        person.shareEmailOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'share-email')
            .map((a) => a[1])
            .join(',');
        await personDataService.updatePersonByDiscordId(person);
        interaction.editReply(markdownService.md.GENERIC_OK({}));
    }
}
exports.PermissionEditButtonEvent = PermissionEditButtonEvent;

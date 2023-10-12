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
    await interaction.deferReply();
    if (step === 'start') {
        interaction.editReply({
            content: markdownService.md.PERMISSION_EDIT({}),
            components: (0, component_1.PermissionToSelectComponent)()
        });
    }
    if (step === 'contact-text-on') {
        interaction.editReply(interaction.values.join(','));
    }
    if (step === 'contact-email-on') {
        interaction.editReply(interaction.values.join(','));
    }
    if (step === 'share-phone-on') {
        interaction.editReply(interaction.values.join(','));
    }
    if (step === 'share-email-on') {
        interaction.editReply(interaction.values.join(','));
    }
}
exports.PermissionEditButtonEvent = PermissionEditButtonEvent;

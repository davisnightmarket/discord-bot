"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionButtonEvent = exports.PermissionEditSelectEvent = exports.PermissionCommandEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
const const_1 = require("../const");
// in which user edits their availability
const dbg = (0, utility_1.Dbg)('PermissionEditButtonEvent');
async function PermissionCommandEvent({ personDataService, markdownService }, interaction, discordId) {
    // make sure crabapple doesn't choke while waiting for data
    await interaction.deferReply({ ephemeral: true });
    const person = await personDataService.getPersonByDiscordId(discordId);
    if (!person) {
        // show them their modal
        interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
        return;
    }
    const components = (0, component_1.PermissionStartComponent)(discordId);
    const permissionList = personDataService.getPermissionListMd(person);
    dbg(permissionList);
    const content = [
        markdownService.md.PERMISSION_LIST({
            permissionList
        })
    ].join('\n') + '\n';
    interaction.editReply({
        content,
        components
    });
}
exports.PermissionCommandEvent = PermissionCommandEvent;
// when they submit the edit button OR submit the actual selection
async function PermissionEditSelectEvent({ personDataService, markdownService }, interaction, discordId, [command, step, day]) {
    if (command !== 'permission') {
        return;
    }
    dbg('permission', command);
    dbg(command, step, day);
    await interaction.deferReply({ ephemeral: true });
    // step from the custom id tells us where we are in the process
    const person = await personDataService.getPersonByDiscordId(discordId);
    if (step === 'edit') {
        if (!person) {
            //! we would like to show them their modal
            // // we cannot show the identity model since we have deferred
            // interaction.editReply({
            //     content: await markdownService.getGenericNoPerson()
            // });
            await interaction.editReply(markdownService.md.GENERIC_SORRY({
                techPhone: ''
            }));
            return;
        }
        person.permissionList = interaction.values
            .map((a) => a.split('---'))
            .map((a) => a[1])
            .join(',');
        await personDataService.updatePersonByDiscordId(person);
        await interaction.editReply([
            markdownService.md.GENERIC_OK({}),
            markdownService.md.PERMISSION_LIST({
                permissionList: personDataService.getPermissionListMd(person)
            })
        ].join('\n'));
    }
}
exports.PermissionEditSelectEvent = PermissionEditSelectEvent;
// when they submit the edit button OR submit the actual selection
async function PermissionButtonEvent({ personDataService, markdownService }, interaction, discordId, [command, step, day]) {
    if (command !== 'permission') {
        return;
    }
    dbg(command, step, day);
    await interaction.deferReply({ ephemeral: true });
    if (step === 'start') {
        await interaction.editReply({
            content: markdownService.md.PERMISSION_EDIT({}),
            components: (0, component_1.PermissionToSelectComponent)(discordId)
        });
        return;
    }
    if (step === 'revoke') {
        const person = await personDataService.getPersonByDiscordId(discordId);
        if (!person) {
            await interaction.editReply(markdownService.md.GENERIC_SORRY({
                techPhone: ''
            }));
            return;
        }
        person.permissionList = '';
        await personDataService.updatePersonByDiscordId(person);
        await interaction.editReply([
            markdownService.md.GENERIC_OK({}),
            markdownService.md.PERMISSION_LIST({
                permissionList: personDataService.getPermissionListMd(person)
            })
        ].join('\n'));
        return;
    }
    if (step === 'grant-all') {
        const person = await personDataService.getPersonByDiscordId(discordId);
        if (!person) {
            await interaction.editReply(markdownService.md.GENERIC_SORRY({
                techPhone: ''
            }));
            return;
        }
        person.permissionList = const_1.PERMISSION_CODE_LIST.join(',');
        await personDataService.updatePersonByDiscordId(person);
        await interaction.editReply([
            markdownService.md.GENERIC_OK({}),
            markdownService.md.PERMISSION_LIST({
                permissionList: personDataService.getPermissionListMd(person)
            })
        ].join('\n'));
        return;
    }
}
exports.PermissionButtonEvent = PermissionButtonEvent;

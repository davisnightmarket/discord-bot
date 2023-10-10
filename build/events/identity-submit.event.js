"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentitySubmitEvent = void 0;
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('IdentityEditEvent');
async function IdentitySubmitEvent({ personDataService }, interaction) {
    if (interaction.customId !== 'identity') {
        return;
    }
    dbg('ok');
    interaction.deferReply({
        ephemeral: true
    });
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        interaction.editReply({
            content: 'Sorry, we cannot find that!'
        });
        return;
    }
    // for (const k of Object.keys(person as PersonModel)) {
    //     const value = interaction.fields.getTextInputValue(k).trim();
    //     if (value) {
    //         person[k] = value;
    //     }
    // }
    const name = interaction.fields.getTextInputValue('identity--name').trim();
    console.log(name);
    await personDataService.updatePersonByDiscordId({
        ...person,
        name
    });
    interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.IdentitySubmitEvent = IdentitySubmitEvent;

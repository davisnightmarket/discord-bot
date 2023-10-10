"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentitySubmitEvent = void 0;
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('IdentityEditEvent');
async function IdentitySubmitEvent({ personDataService }, interaction) {
    if (interaction.customId !== 'identity-edit') {
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
    for (const k of Object.keys(person)) {
        let value = '';
        try {
            value = interaction.fields.getTextInputValue(k).trim();
        }
        catch (e) {
            console.log(e.message);
        }
        if (value) {
            person[k] = value;
        }
    }
    await personDataService.updatePersonByDiscordId({
        ...person
    });
    interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.IdentitySubmitEvent = IdentitySubmitEvent;

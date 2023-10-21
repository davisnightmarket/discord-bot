"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditModalEvent = exports.IdentityCommandEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('IdentityEvent');
async function IdentityCommandEvent({ personDataService }, interaction, discordId) {
    dbg('IdentityCommandEvent');
    // ! for some reason this is taking too long sometimes. Why? It is cached data
    // i think this is because when the cache is reloading, the reply has to wait for more
    // than three seconds, which discord doesn't allow. We will have to live with this.
    const person = await personDataService.getPersonByDiscordId(discordId);
    //show them their modal
    try {
        await interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
    }
    catch (e) {
        console.error(e);
    }
}
exports.IdentityCommandEvent = IdentityCommandEvent;
async function IdentityEditModalEvent({ personDataService }, interaction, discordId, [command]) {
    if (command !== 'identity-edit') {
        return;
    }
    dbg('IdentityEditModalEvent');
    interaction.deferReply({
        ephemeral: true
    });
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(discordId);
    if (!person) {
        await interaction.editReply({
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
            console.error(e.message);
        }
        if (value) {
            person[k] = value;
        }
    }
    await personDataService.updatePersonByDiscordId({
        ...person
    });
    await interaction.editReply({
        content: 'OK, all set!'
    });
}
exports.IdentityEditModalEvent = IdentityEditModalEvent;

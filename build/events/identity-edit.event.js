"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditEvent = void 0;
const component_1 = require("../component");
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('IdentityEditEvent');
async function IdentityEditEvent({ personDataService }, interaction) {
    dbg('ok');
    if (!interaction.guild) {
        interaction.reply('Hi, you can only do that on the server!');
        return;
    }
    // ! for some reason this is taking too long. Why? It is cached data at times
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    //show them their modal
    try {
        await interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
    }
    catch (e) {
        console.error(e);
    }
    // interaction.showModal(
    //     IdentityEditModalComponent(personDataService.createPerson({}))
    // );
}
exports.IdentityEditEvent = IdentityEditEvent;

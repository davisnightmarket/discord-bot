"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditEvent = void 0;
const component_1 = require("../component");
async function IdentityEditEvent({ personDataService }, interaction) {
    if (!interaction.guild) {
        interaction.reply('Hi, you can only do that on the server!');
        return;
    }
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    // show them their modal
    interaction.showModal((0, component_1.IdentityEditModalComponent)(personDataService.createPerson(person)));
}
exports.IdentityEditEvent = IdentityEditEvent;

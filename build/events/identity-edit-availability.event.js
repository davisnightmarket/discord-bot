"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEditAvailabilityEvent = void 0;
const component_1 = require("../component");
// in which user edits their availability
async function IdentityEditAvailabilityEvent({ personDataService }, interaction) {
    if (!interaction.guild) {
        interaction.reply('Hi, you can only do that on the server!');
        return;
    }
    interaction = interaction;
    if (interaction.commandName !== 'identity') {
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(interaction.user.id);
    if (!person) {
        interaction.editReply({
            content: 'Sorry, we could not find your record.'
        });
        // show them their modal
        interaction.showModal((0, component_1.IdentityEditModalComponent)({ discordId: interaction.user.id }));
    }
    // show them their modal
    interaction.editReply({
        content: '',
        components: (0, component_1.IdentityEditAvailabilityComponent)(person)
    });
}
exports.IdentityEditAvailabilityEvent = IdentityEditAvailabilityEvent;

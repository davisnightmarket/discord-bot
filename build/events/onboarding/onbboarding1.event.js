"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Onboarding1Event = void 0;
// first onboarding message
async function Onboarding1Event(member, { personDataService }) {
    if (!member.guild) {
        return;
    }
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(member.user.id);
    const { components, content } = IdentityWelcomeComponent(person || { discordId: member.user.id });
    member.send({
        content: 'hi'
    });
}
exports.Onboarding1Event = Onboarding1Event;

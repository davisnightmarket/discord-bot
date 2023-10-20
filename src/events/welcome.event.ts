import { GuildMember } from 'discord.js';

export const WelcomeEvent = async (member: GuildMember) => {
    // TODO: add content
    member.send({
        content: 'Welcome! ... what do we say?'
    });
};

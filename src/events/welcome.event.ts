import type { GuildMember } from 'discord.js';
import { GetDebug, type GuildServiceModel } from '../utility';

const dbg = GetDebug('events:WelcomeEvent');

// this event fires on EVERY guild message or guild member join
export const WelcomeEvent = async (
    services: GuildServiceModel,
    member: GuildMember
) => {
    dbg('with person id', member.id);
    if (member.user.bot) return;
    const { onboardingService } = services;
    // find the person in the GSpread
    const personExists = await onboardingService.personExistsWithDiscordId(
        member.id
    );

    if (!personExists) {
        dbg('no person found in spreadsheet', member.id);
    }

    // TODO: add content
    member.send({
        content: 'Welcome! ... what do we say?'
    });
};

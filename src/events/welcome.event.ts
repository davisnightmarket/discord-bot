import type { GuildMember } from 'discord.js';
import { GetDebug, type GuildServiceModel } from '../utility';

const dbg = GetDebug('events:WelcomeEvent');

const CONTACT_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days

// this event fires on EVERY guild message or guild member join
export const WelcomeEvent = async (
    services: GuildServiceModel,
    member: GuildMember
) => {
    dbg('Welcome event possible with person id', member.id);
    if (member.user.bot) return;
    const { onboardingService } = services;
    // find the person in the GSpread
    // note: this only includes active folks
    const [stampLastContacted, isOnboarded] =
        await onboardingService.getStampLastContactedAndIsOnboardedByDiscordId(
            member.id
        );

    // this person has never been contacted OR they are inactive
    if (!stampLastContacted) {
        dbg('We have never contacted tihs person', member.id);
        // first check if they have an inactive spreadsheet record
        // if so, activate them, and they will hit this logic next time they message
        // (this means they have to create two messages before we trigger any crabapple contact.
        // this gives folks a chance to say like "hey, I'm not active anymore, please remove me" or something)
        const didActivate = onboardingService.activatePersonByDiscordId(
            member.id
        );

        if (!didActivate) {
            // if we failed to activate them, we need to check to big data base
            dbg('failed to activate person', member.id);
            // in this case we create a new person because they do not exist
            const [person, emailList] =
                await onboardingService.createOrUpdateRdbPersonByDiscordId(
                    member.id,
                    member.displayName
                );
            // find out if we have someone with this email in the spreadsheet already
            const personList = await onboardingService.findPersonsByEmailList(emailList);
            if (personList.length === 1) {
                onboardingService.updateSheetPersonByEmail({
                    discordId: member.id,
                    ...personList[0],
                    email:personList[0]?.email||''
                });
            } else {
            // if we do, we should add the discord id to their record
            onboardingService.createFirstSheetPerson(member.id,member.displayName)    
            }
            
    } else if (
        !isOnboarded && stampLastContacted &&
        Date.now() - (new Date(stampLastContacted)).getTime() > CONTACT_INTERVAL
    ) {
        // if they are not onboarded, and it has been more than 30 days since they were last contacted
        // send them a message

        member.send({
            content: 'Welcome! ... what do we say?'
        });
        // and set our last contacted date to now
        await onboardingService.setStampLastContacted(member.id);
    }

    dbg('no active person found in spreadsheet', member.id);

    // check the
    // TODO: add content
};

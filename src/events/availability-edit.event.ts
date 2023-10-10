import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import {
    AvailabilityHostComponent,
    IdentityEditModalComponent
} from '../component';
import { DAYS_OF_WEEK } from '../const';
import { ParseContentService } from '../service';

// in which user edits their availability

export async function IdentityEditAvailabilityEvent(
    { personDataService, nightDataService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );

    if (!person) {
        // show them their modal
        interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
        return;
    }

    await interaction.deferReply();

    const dayTimes = await nightDataService.waitingForNightCache.then(
        (nightOps) => {
            const dayTimesMap = nightOps.reduce<{
                [k in string]: [string, string];
            }>((a, b) => {
                if (b.day && b.timeStart && !a[b.day + b.timeStart]) {
                    a[b.day + b.timeStart] = [
                        `${b.day}||${b.timeStart}`,
                        `${
                            DAYS_OF_WEEK[b.day].name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(
                            b.timeStart
                        )}`
                    ];
                }
                return a;
            }, {});
            return Object.values(dayTimesMap);
        }
    );
    // todo: show host then pickup, since we can't fit them all
    const components = AvailabilityHostComponent(
        dayTimes,
        personDataService.createPerson(person)
    );

    // response
    interaction.editReply({
        content:
            'Which days and times are you available to host Night Market?\n You can select multiple days and times.',
        components
    });
}

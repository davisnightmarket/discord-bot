import {
    type ButtonInteraction,
    type StringSelectMenuInteraction,
    type ChatInputCommandInteraction
} from 'discord.js';

import { type NmDayNameType, type NmNightRoleType } from '../model';
import {
    GetVolunteerDistroComponent,
    GetVolunteerInitComponent,
    GetVolunteerPickupComponent
} from '../component/volunteer.component';
import {
    Dbg,
    GetChannelDayNameFromInteraction,
    GetChannelDayToday,
    type GuildServiceModel
} from '../utility';

import { type PeriodStatusType } from '../service';

const dbg = Dbg('VolunteerEvent');
// todo: split this into different events for clarity
// when a person issues a volunteer command it means they want to view
// and possibly edit their volunteer commitments
export async function VolunteerCommandEvent(
    { nightDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    // get the channel day or otherwise the current day
    const day =
        (await GetChannelDayNameFromInteraction(interaction)) ??
        GetChannelDayToday();

    // get
    dbg(day);

    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });
    // TODO: some logic here to figure out:
    // check their history to see if they
    // need to shadow -- this can be done with NightPerson Status in night data

    await interaction.editReply({
        content: markdownService.getNightMapEphemeral(discordId, nightMap),

        components: GetVolunteerInitComponent({
            day,
            discordId
        })
    });
}

// when they hit the pickup button, the editing begins
export async function VolunteerPickupButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, NmNightRoleType, string]
) {
    if (command !== 'volunteer-pickup') {
        return;
    }

    dbg('volunteer-pickup', [command, day, discordId]);

    interaction.deferReply({ ephemeral: true });

    const nightMap = await nightDataService.getNightMapByDay(day);
    const pickupList = [...nightMap.marketList.map((a) => a.pickupList)].flat();
    if (pickupList.length) {
        const components = GetVolunteerPickupComponent(
            {
                day,
                discordId
            },
            pickupList
        );
        interaction.editReply({
            content: `Replace pick-ups:\n ${markdownService.getMyPickups(
                discordId,
                nightMap
            )} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
        return;
    }

    await interaction.editReply({
        content: `No pickups available on ${day}. Choose another day:`
        // todo: add day select button
    });
}
export async function VolunteerDistroButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, NmNightRoleType, string]
) {
    if (command !== 'volunteer-distro') {
        return;
    }

    dbg('volunteer-distro', [command, day, discordId]);

    interaction.deferReply({ ephemeral: true });

    const nightMap = await nightDataService.getNightMapByDay(day);
    const { marketList } = nightMap;
    if (!marketList.length) {
        await interaction.editReply({
            content: `No hosting available on ${day}. Choose another day:`
            // todo: add day select button
        });
    } else if (marketList.length === 1) {
        const { orgPickup, orgMarket, timeStart, timeEnd } = marketList[0];

        const addList = [
            {
                day,
                role: 'night-distro' as NmNightRoleType,
                discordIdOrEmail: discordId,
                periodStatus: 'ALWAYS' as PeriodStatusType,
                orgPickup,
                orgMarket,
                timeStart,
                timeEnd
            }
        ];

        await nightDataService.addHostForOnePersonAndDay(
            day,
            discordId,
            addList
        );
        await interaction.editReply({
            content: `OK all set!`
            // todo: add day select button
        });
    } else {
        const components = GetVolunteerDistroComponent(
            {
                day,
                discordId
            },
            marketList
        );
        interaction.editReply({
            content: `Replace distro:\n ${markdownService.getMyDistros(
                discordId,
                nightMap
            )} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
    }
}
// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
export async function VolunteerPickupSaveSelectEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-pickup-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    const addList = nightDataService.getNightDataDiscordSelectValues(
        interaction.values,
        {
            day,
            role: 'night-pickup',
            discordIdOrEmail: discordId,
            periodStatus: 'ALWAYS'
        }
    );
    dbg(`Adding ${addList.length} records`);
    await nightDataService.replacePickupsForOnePersonAndDay(
        day,
        discordId,
        addList
    );

    const nightMap = await nightDataService.getNightMapByDay(day, {
        refreshCache: true
    });

    // succcess!
    await interaction.editReply({
        content:
            'OK, all set!\n' + markdownService.getMyPickups(discordId, nightMap)
    });
}

export async function VolunteerPickupDeleteButtonEvent(
    { nightDataService, markdownService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType, string]
) {
    if (command !== 'volunteer-pickup-delete') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);

    // todo: make sure we are only sending addList for this discordId and day?

    await nightDataService.replacePickupsForOnePersonAndDay(day, discordId, []);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

// this fires when a select interaction to choose pickups is triggered
// it is the complete set of pickups for that day and person - it replaces all records for that day/person
export async function VolunteerDistroSaveSelectEvent(
    { nightDataService }: GuildServiceModel,
    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, day]: [string, NmDayNameType]
) {
    if (command !== 'volunteer-distro-update') {
        return;
    }
    interaction.deferReply({ ephemeral: true });
    dbg(command, day);
    // const nightMap = await nightDataService.getNightMapByDay(day, {
    //     refreshCache: true
    // });

    // todo: fix this since we now have the capacity for multiple markets per day

    const addList = nightDataService.getNightDataDiscordSelectValues(
        interaction.values,
        {
            day,
            role: 'night-distro',
            discordIdOrEmail: discordId,
            periodStatus: 'ALWAYS'
        }
    );
    await nightDataService.addHostForOnePersonAndDay(day, discordId, addList);
    // succcess!
    await interaction.editReply({
        content: 'OK, all set!'
    });
}

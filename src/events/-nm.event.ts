import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    StringSelectMenuInteraction
} from 'discord.js';
import { DebugUtility, GetChannelDayNameFromInteraction } from '../utility';
import {
    GuildServiceModel,
    NmDayNameType,
    NmNightRoleType,
    NmRolePeriodType
} from '../model';
import * as Component from '../component';

const dbg = DebugUtility('NmEvent');

// provide a general help response for NM command without options
export async function NmEvent(
    { markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    // if (interaction.commandName !== 'nm') {
    //     return;
    // }
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    interaction.editReply(markdownService.md.GENERIC_OK({}));
}

// list person availability record
export async function NmAvailabilityCommandEvent(
    { personDataService, markdownService }: GuildServiceModel,
    interaction: ChatInputCommandInteraction,
    discordId: string,
    command: string
) {
    if (command !== 'availability') {
        return;
    }
    dbg('ok');
    // get the person's data
    const person = await personDataService.getPersonByDiscordId(discordId);

    if (!person) {
        // show them their modal
        interaction.showModal(
            Component.IdentityEditModalComponent(
                personDataService.createPerson(person)
            )
        );
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const [availabilityHostList, availabilityPickupList] =
        markdownService.getAvailabilityListsFromPerson(person);

    const components = Component.AvailabilityAndPermissionEditButtonComponent();

    const contactTextOnList =
            personDataService.getContactTextPermissionListMd(person),
        contactEmailOnList =
            personDataService.getContactEmailPermissionListMd(person),
        sharePhoneOnList =
            personDataService.getSharePhonePermissionListMd(person),
        shareEmailOnList =
            personDataService.getShareEmailPermissionListMd(person);

    dbg(shareEmailOnList, contactTextOnList);
    const content =
        [
            markdownService.md.AVAILABILITY_LIST({
                availabilityHostList,
                availabilityPickupList
            }),
            markdownService.md.PERMISSION_LIST({
                contactTextOnList,
                contactEmailOnList,
                sharePhoneOnList,
                shareEmailOnList
            })
        ].join('\n') + '\n';

    interaction.editReply({
        content,
        components
    });
}

export async function NmAvailabilityEditInitEvent(
    { personDataService, markdownService, nightDataService }: GuildServiceModel,
    interaction: ChatInputCommandInteraction,
    discordId: string,
    [step, role, day]: [string, NmNightRoleType, NmDayNameType]
) {
    dbg('ok');
    if (step !== 'availability-edit' && step !== 'night-host') {
        return;
    }

    // get the person's data
    const person = await personDataService.getPersonByDiscordId(
        interaction.user.id
    );
    if (!person) {
        interaction.showModal(
            Component.IdentityEditModalComponent(
                personDataService.createPerson(person)
            )
        );
        return;
    }

    await interaction.deferReply({ ephemeral: true });
    if (!person) {
        // show them their modal
        interaction.showModal(
            Component.IdentityEditModalComponent(
                personDataService.createPerson(person)
            )
        );
        return;
    }

    const dayTimes =
        await nightDataService.getDayTimeIdAndReadableByDayAsTupleList();

    // todo: show host then pickup, since we can't fit them all
    const components = Component.AvailabilityToHostComponent(
        dayTimes,
        personDataService.createPerson(person)
    );
    // response
    interaction.editReply({
        content: markdownService.md.AVAILABILITY_TO_HOST({}),
        components
    });
}

// responds with an ephemeral message listing the user contact infor
// as long as they have given permission
export async function NmContactListEvent({
    interaction
}: {
    interaction: CommandInteraction;
}) {
    interaction.reply('List contact info ...');
}

export async function NmVolunteerListEvent(
    { processEventService, discordReplyService }: GuildServiceModel,
    interaction: ChatInputCommandInteraction,
    discordId: string,

    [command]: [string]
) {
    if (command !== 'volunteer') {
        return;
    }
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    // get our content and component datas
    const [contentData, componentData] =
        await processEventService.getVolunteerListContent(
            await GetChannelDayNameFromInteraction(interaction)
        );

    // send it back!
    interaction.editReply(
        // gives us content and components
        discordReplyService.getNmVolunteerListEventReply(
            discordId,
            contentData,
            componentData
        )
    );
}

// here the user is requesting to edit their Volunteer commitment
export async function NmVolunteerEditInitEvent(
    { nightDataService, discordReplyService }: GuildServiceModel,
    interaction: ButtonInteraction,
    discordId: string,
    [command, day, role, period]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ]
) {
    if (command !== 'volunteer-edit-init') {
        return;
    }

    dbg('NmVolunteerEditRequestEvent', command, day, role, period);

    interaction.deferReply({ ephemeral: true });

    const { pickupList, hostList } = await nightDataService.getNightByDay(day);

    // TODO: split these into separate events
    // in this case we show a period select
    if (!period) {
        interaction.editReply(
            await discordReplyService.getNmVolunteerEditPeriodRequest({
                day,
                role,
                discordId,
                hostList
            })
        );

        return;
    }

    if (role === 'night-pickup') {
        console.log('NIGHT PICKUP', pickupList);
        const components = GetVolunteerPickupComponent(
            {
                day,
                role,
                period
            },
            pickupList
        );
        // TODO: we can only select 25 at a time, so slice em up

        interaction.editReply({
            content: 'OK, all set!',
            components
        });

        return;
    }

    if (role === 'night-host') {
        // TODO: save to DB
        await nightDataService.addNightData([
            {
                day,
                org: '', // this should be Davis Night Market in Central Park
                role,
                discordIdOrEmail: interaction.user.id,
                period,
                // both of these should be got from core data
                timeStart: '2100',
                timeEnd: ''
            }
        ]);
        // succcess!
        interaction.editReply({
            content: 'OK, all set!'
        });

        return;
    }
}

export async function NmVolunteerEditSaveEvent(
    { nightDataService, discordReplyService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    // we get the id of the target user
    discordIdOrEmail: string,
    // the button custom id split on '--'
    [command, day, role, period]: [
        string,
        NmDayNameType,
        NmNightRoleType,
        NmRolePeriodType
    ],
    // the values of the interaction
    [org, timeStart]: [string, string]
) {
    if (command !== 'volunteer-edit-save') {
        return;
    }
    // the interaction values from the menu
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });

    // TODO: save to DB

    await nightDataService.addNightData([
        {
            day,
            org, // this should be Davis Night Market in Central Park
            role,
            discordIdOrEmail,
            period,
            timeStart,
            // both of these should be got from core data
            timeEnd: ''
        }
    ]);

    interaction.editReply(
        discordReplyService.getNmVolunteerEditSaveEventReply()
    );
}

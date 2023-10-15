import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction
} from 'discord.js';
import { NmDayNameType } from '../model';
import {
    IdentityEditModalComponent,
    PermissionStartComponent,
    PermissionToSelectComponent
} from '../component';
import { Dbg, type GuildServiceModel } from '../utility';
import { PERMISSION_CODE_LIST } from '../const';

// in which user edits their availability

const dbg = Dbg('PermissionEditButtonEvent');

export async function PermissionCommandEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction,
    discordId: string
) {
    // make sure crabapple doesn't choke while waiting for data
    interaction.deferReply({ ephemeral: true });
    const person = await personDataService.getPersonByDiscordId(discordId);

    if (!person) {
        // show them their modal
        interaction.showModal(
            IdentityEditModalComponent(personDataService.createPerson(person))
        );
        return;
    }

    const components = PermissionStartComponent(discordId);

    const permissionList = personDataService.getPermissionListMd(person);

    dbg(permissionList);
    const content =
        [
            markdownService.md.PERMISSION_LIST({
                permissionList
            })
        ].join('\n') + '\n';

    interaction.editReply({
        content,
        components
    });
}

// when they submit the edit button OR submit the actual selection
export async function PermissionEditSelectEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    discordId: string,
    [command, step, day]: [string, 'edit', NmDayNameType]
) {
    if (command !== 'permission') {
        return;
    }

    dbg('permission', command);

    dbg(command, step, day);

    await interaction.deferReply({ ephemeral: true });

    // step from the custom id tells us where we are in the process

    const person = await personDataService.getPersonByDiscordId(discordId);

    if (step === 'edit') {
        if (!person) {
            //! we would like to show them their modal
            // // we cannot show the identity model since we have deferred
            // interaction.editReply({
            //     content: await markdownService.getGenericNoPerson()
            // });
            interaction.editReply(
                markdownService.md.GENERIC_SORRY({
                    techPhone: ''
                })
            );
            return;
        }

        person.permissionList = interaction.values
            .map((a) => a.split('---'))
            .map((a) => a[1])
            .join(',');

        await personDataService.updatePersonByDiscordId(person);

        interaction.editReply(
            [
                markdownService.md.GENERIC_OK({}),
                markdownService.md.PERMISSION_LIST({
                    permissionList:
                        personDataService.getPermissionListMd(person)
                })
            ].join('\n')
        );
    }
}

// when they submit the edit button OR submit the actual selection
export async function PermissionButtonEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: ButtonInteraction,
    discordId: string,
    [command, step, day]: [
        string,
        'start' | 'revoke' | 'grant-all',
        NmDayNameType
    ]
) {
    if (command !== 'permission') {
        return;
    }

    dbg(command, step, day);

    await interaction.deferReply({ ephemeral: true });

    if (step === 'start') {
        interaction.editReply({
            content: markdownService.md.PERMISSION_EDIT({}),
            components: PermissionToSelectComponent(discordId)
        });
        return;
    }

    if (step === 'revoke') {
        const person = await personDataService.getPersonByDiscordId(discordId);

        if (!person) {
            interaction.editReply(
                markdownService.md.GENERIC_SORRY({
                    techPhone: ''
                })
            );
            return;
        }
        person.permissionList = '';

        await personDataService.updatePersonByDiscordId(person);

        interaction.editReply(
            [
                markdownService.md.GENERIC_OK({}),
                markdownService.md.PERMISSION_LIST({
                    permissionList:
                        personDataService.getPermissionListMd(person)
                })
            ].join('\n')
        );
        return;
    }

    if (step === 'grant-all') {
        const person = await personDataService.getPersonByDiscordId(discordId);

        if (!person) {
            interaction.editReply(
                markdownService.md.GENERIC_SORRY({
                    techPhone: ''
                })
            );
            return;
        }
        person.permissionList = PERMISSION_CODE_LIST.join(',');

        await personDataService.updatePersonByDiscordId(person);

        interaction.editReply(
            [
                markdownService.md.GENERIC_OK({}),
                markdownService.md.PERMISSION_LIST({
                    permissionList:
                        personDataService.getPermissionListMd(person)
                })
            ].join('\n')
        );
        return;
    }
}

import { StringSelectMenuInteraction } from 'discord.js';
import { GuildServiceModel, NmDayNameType } from '../model';
import { PermissionToSelectComponent } from '../component';
import { Dbg } from '../utility';

// in which user edits their availability

const dbg = Dbg('PermissionEditButtonEvent');
export async function PermissionEditButtonEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    args: string
) {
    const [command, step, day] = args.split('--') as [
        string,
        'start' | 'edit',
        NmDayNameType
    ];

    dbg(command, step, day);

    // todo: handle this higher up
    if (command !== 'permission') {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    if (step === 'start') {
        interaction.editReply({
            content: markdownService.md.PERMISSION_EDIT({}),
            components: PermissionToSelectComponent()
        });
        return;
    }

    if (step === 'edit') {
        const person = await personDataService.getPersonByDiscordId(
            interaction.user.id
        );

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

        person.contactTextOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'contact-text')
            .map((a) => a[1])
            .join(',');
        person.sharePhoneOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'share-phone')
            .map((a) => a[1])
            .join(',');
        person.contactEmailOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'contact-email')
            .map((a) => a[1])
            .join(',');
        person.shareEmailOn = interaction.values
            .map((a) => a.split('---'))
            .filter((a) => a[0] === 'share-email')
            .map((a) => a[1])
            .join(',');

        await personDataService.updatePersonByDiscordId(person);

        interaction.editReply(markdownService.md.GENERIC_OK({}));
    }
}

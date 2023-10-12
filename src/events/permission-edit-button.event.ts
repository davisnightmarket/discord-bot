import { StringSelectMenuInteraction } from 'discord.js';
import { GuildServiceModel, NmDayNameType } from '../model';
import { PermissionToSelectComponent } from '../component';
import { Dbg } from '../utility';

// in which user edits their availability

const dbg = Dbg('PermissionEditButtonEvent');
export async function PermissionEditButtonEvent(
    { personDataService, nightDataService, markdownService }: GuildServiceModel,

    interaction: StringSelectMenuInteraction,
    args: string
) {
    const [command, step, day] = args.split('--') as [
        string,
        (
            | 'start'
            | 'contact-text-on'
            | 'contact-email-on'
            | 'share-phone-on'
            | 'share-email-on'
        ),
        NmDayNameType
    ];

    dbg(command, step, day);

    // todo: handle this higher up
    if (command !== 'permission') {
        return;
    }

    await interaction.deferReply();

    if (step === 'start') {
        interaction.editReply({
            content: markdownService.md.PERMISSION_EDIT({}),
            components: PermissionToSelectComponent()
        });
    }

    if (step === 'contact-text-on') {
        interaction.editReply(interaction.values.join(','));
    }

    if (step === 'contact-email-on') {
        interaction.editReply(interaction.values.join(','));
    }

    if (step === 'share-phone-on') {
        interaction.editReply(interaction.values.join(','));
    }

    if (step === 'share-email-on') {
        interaction.editReply(interaction.values.join(','));
    }
}

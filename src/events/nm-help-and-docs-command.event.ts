import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import { Dbg } from '../utility';

const dbg = Dbg('HelpAndDocsCommandEvent');

export async function HelpAndDocsCommandEvent(
    { markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    if (interaction.commandName !== 'help-and-docs') {
        return;
    }
    dbg('ok');

    interaction.reply({
        content: markdownService.md.START_HOWTO({
            // todo implement docs list and get them for core ...
            coreDocsList: markdownService.getGenericBulletList([]),
            // todo: and per market
            marketDocsList: markdownService.getGenericBulletList([]),
            // todo get people
            communityCoordinatorList:
                markdownService.getPersonBulletListWithPhone([]),
            nightCaptainList: markdownService.getPersonBulletList([]),

            // todo get core phone
            corePhoneNumber: '',
            // todo get market phone
            marketPhoneNumber: ''
        })
    });
}

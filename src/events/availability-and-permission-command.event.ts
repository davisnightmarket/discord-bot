import { ChatInputCommandInteraction } from 'discord.js';
import { GuildServiceModel } from '../model';
import {
    AvailabilityAndPermissionEditButtonComponent,
    IdentityEditModalComponent
} from '../component';
import { Dbg } from '../utility';
import {
    PERMISSION_TO_CONTACT_EMAIL_MAP,
    PERMISSION_TO_CONTACT_TEXT_MAP,
    PERMISSION_TO_SHARE_EMAIL_MAP,
    PERMISSION_TO_SHARE_PHONE_MAP,
    PermissionToContactEmailType,
    PermissionToContactTextType,
    PermissionToShareEmailType,
    PermissionToSharePhoneType
} from '../const';

// in which user edits their availability

const dbg = Dbg('AvailabilityCommandEvent');
export async function AvailabilityAndPermissionCommandEvent(
    { personDataService, markdownService }: GuildServiceModel,

    interaction: ChatInputCommandInteraction
) {
    dbg('ok');
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

    await interaction.deferReply({ ephemeral: true });

    const [availabilityHostList, availabilityPickupList] =
        markdownService.getAvailabilityListsFromPerson(person);

    const components = AvailabilityAndPermissionEditButtonComponent();
    // todo: move to markdown service

    console.log(person);
    const contactTextOnList =
            person.contactTextOn
                .split(',')
                .filter((a) => a)
                .map(
                    (a) =>
                        `  - ${
                            PERMISSION_TO_CONTACT_TEXT_MAP[
                                a as PermissionToContactTextType
                            ].name
                        }`
                )
                .join('\n') || '  - NO PERMISSIONS GRANTED',
        contactEmailOnList =
            person.contactEmailOn
                .split(',')
                .filter((a) => a)
                .map(
                    (a) =>
                        `  - ${
                            PERMISSION_TO_CONTACT_EMAIL_MAP[
                                a as PermissionToContactEmailType
                            ].name
                        }`
                )
                .join('\n') || '  - NO PERMISSIONS GRANTED',
        sharePhoneOnList =
            person.sharePhoneOn
                .split(',')
                .filter((a) => a)
                .map(
                    (a) =>
                        `  - ${
                            PERMISSION_TO_SHARE_PHONE_MAP[
                                a as PermissionToSharePhoneType
                            ].name
                        }`
                )
                .join('\n') || '  - NO PERMISSIONS GRANTED',
        shareEmailOnList =
            person.shareEmailOn
                .split(',')
                .filter((a) => a)
                .map(
                    (a) =>
                        `  - ${
                            PERMISSION_TO_SHARE_EMAIL_MAP[
                                a as PermissionToShareEmailType
                            ].name
                        }`
                )
                .join('\n') || '  - NO PERMISSIONS GRANTED';

    dbg(shareEmailOnList, contactTextOnList);
    const content = [
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
    ].join('\n');
    // response
    interaction.editReply({
        content,
        components
    });
}

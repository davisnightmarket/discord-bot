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

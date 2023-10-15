import * as Component from '../component';
import { NmDayNameType, NmNightRoleType, NmRoleType } from '../model';
import { MarkdownService, NightPickupModel, PersonModel } from '.';
import { NM_NIGHT_ROLES } from '../const';

export class DiscordReplyService {
    markdownService: MarkdownService;
    constructor(markdownService: MarkdownService) {
        this.markdownService = markdownService;
    }

    // getNmVolunteerListEventReply(
    //     discordId: string,
    //     markdownData: {
    //         roleName: string;
    //         roleDescription: string;
    //         hostList: string;
    //     },
    //     componentData: {
    //         day: NmDayNameType;
    //         pickupList: NightPickupModel[];
    //     }
    // ) {
    //     const content =
    //         this.markdownService.md.VOLUNTEER_ONCE_OR_COMMIT(markdownData);
    //     const components = Component.GetVolunteerRoleComponent({
    //         ...componentData,
    //         discordId
    //     });

    //     return {
    //         content,
    //         components
    //     };
    // }

    getNmEventReply() {
        const content = this.markdownService.md.GENERIC_OK({});

        return {
            content
        };
    }

    getNmVolunteerEditSaveEventReply() {
        return {
            content: this.markdownService.md.GENERIC_OK({})
        };
    }
    // async getNmVolunteerEditPeriodRequest({
    //     day,
    //     role,
    //     discordId,
    //     hostList
    // }: {
    //     day: NmDayNameType;
    //     role: NmNightRoleType;
    //     discordId: string;
    //     hostList: PersonModel[];
    // }) {
    //     const components = Component.GetVolunteerPeriodComponent({
    //         day,
    //         role,
    //         discordId
    //     });
    //     const content = await this.markdownService.md.VOLUNTEER_ONCE_OR_COMMIT({
    //         roleName: NM_NIGHT_ROLES[role].name,
    //         roleDescription: NM_NIGHT_ROLES[role].description,
    //         hostList: hostList.map((a) => a.name).join(', ')
    //     });

    //     return {
    //         content,
    //         components
    //     };
    // }
}

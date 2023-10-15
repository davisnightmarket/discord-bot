"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordReplyService = void 0;
class DiscordReplyService {
    constructor(markdownService) {
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
}
exports.DiscordReplyService = DiscordReplyService;

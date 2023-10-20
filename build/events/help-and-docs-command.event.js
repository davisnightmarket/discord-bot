"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpAndDocsCommandEvent = void 0;
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('HelpAndDocsCommandEvent');
async function HelpAndDocsCommandEvent({ markdownService }, interaction) {
    dbg('ok');
    interaction.reply({
        content: markdownService.md.START_HOWTO({
            // todo implement docs list and get them for core ...
            coreDocsList: markdownService.getGenericBulletList([]),
            // todo: and per market
            marketDocsList: markdownService.getGenericBulletList([]),
            // todo get people
            communityCoordinatorList: markdownService.getPersonBulletListWithPhone([]),
            nightCaptainList: markdownService.getPersonBulletList([]),
            // todo get core phone
            corePhoneNumber: '',
            // todo get market phone
            marketPhoneNumber: ''
        })
    });
}
exports.HelpAndDocsCommandEvent = HelpAndDocsCommandEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerDistroButtonEvent = void 0;
const volunteer_component_1 = require("../../component/volunteer.component");
const utility_1 = require("../../utility");
const dbg = (0, utility_1.Dbg)('VolunteerDistroButtonEvent');
async function VolunteerDistroButtonEvent({ nightDataService, markdownService }, interaction, discordId, [command, day]) {
    if (command !== 'volunteer-distro') {
        return;
    }
    dbg('volunteer-distro', [command, day, discordId]);
    interaction.deferReply({ ephemeral: true });
    const nightMap = await nightDataService.getNightMapByDay(day);
    const { marketList } = nightMap;
    if (!marketList.length) {
        await interaction.editReply({
            content: `No hosting available on ${day}. Choose another day:`
            // todo: add day select button
        });
    }
    else if (marketList.length === 1) {
        const { orgPickup, orgMarket, timeStart, timeEnd } = marketList[0];
        const addList = [
            {
                day,
                role: 'night-distro',
                discordIdOrEmail: discordId,
                periodStatus: 'ALWAYS',
                orgPickup,
                orgMarket,
                timeStart,
                timeEnd
            }
        ];
        await nightDataService.addHostForOnePersonAndDay(day, discordId, addList);
        await interaction.editReply({
            content: `OK all set!`
            // todo: add day select button
        });
    }
    else {
        const components = (0, volunteer_component_1.GetVolunteerDistroComponent)({
            day,
            discordId
        }, marketList);
        interaction.editReply({
            content: `Replace distro:\n ${markdownService.getMyDistros(discordId, nightMap)} \nTHESE WILL BE REPLACED BY ANY SELECTION`,
            components
        });
    }
}
exports.VolunteerDistroButtonEvent = VolunteerDistroButtonEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerResponseEvent = void 0;
const const_1 = require("../const");
const volunteer_component_1 = require("../component/volunteer.component");
const utility_1 = require("../utility");
const dbg = (0, utility_1.Dbg)('VolunteerResponseEvent');
// todo: split this into different events for clarity
// when a person requests a listing of
async function VolunteerResponseEvent({ nightDataService, messageService }, interaction) {
    interaction.deferReply();
    const [command, day, role, period] = interaction?.customId?.split('--') || [];
    dbg(command, day, role, period);
    if (command !== 'volunteer') {
        return;
    }
    console.log(command, day, role, period);
    // in this case we are selecting the day (or days) for volunteering, which is the final step
    if (interaction.isStringSelectMenu()) {
        // TODO: save to DB
        const [org, timeStart] = interaction.values[0].split('---');
        await nightDataService.addNightData([
            {
                day,
                org,
                role,
                discordIdOrEmail: interaction.user.id,
                period,
                timeStart,
                // both of these should be got from core data
                timeEnd: ''
            }
        ]);
        interaction.editReply({
            content: interaction.values[0]
        });
    }
    // todo: replace all this with createMessageComponentCollector
    if (interaction.isButton()) {
        interaction = interaction;
        // there should always be a day
        if (!day || !const_1.DAYS_OF_WEEK_CODES.includes(day)) {
            interaction.editReply({
                content: await messageService.getGenericSorry()
            });
            console.error('Passed not a day');
            return;
        }
        const { pickupList, hostList } = await nightDataService.getNightByDay(day);
        // role is selected in the first interaction
        if (!role) {
            interaction.editReply({
                content: await messageService.getGenericSorry()
            });
            console.error('Passed not a role.');
            return;
        }
        if (!period) {
            const components = (0, volunteer_component_1.GetVolunteerPeriodComponent)({ day, role });
            interaction.editReply({
                content: await messageService.m.VOLUNTEER_ONCE_OR_COMMIT({
                    roleName: const_1.NM_NIGHT_ROLES[role].name,
                    roleDescription: const_1.NM_NIGHT_ROLES[role].description,
                    hostNames: hostList.map((a) => a.name).join(', ')
                }),
                components
            });
            return;
        }
        // the successful select is handled above by isStringSelectMenu
        if (role === 'night-pickup') {
            console.log('NIGHT PICKUP', pickupList);
            const components = (0, volunteer_component_1.GetVolunteerPickupComponent)({
                day,
                role,
                period
            }, pickupList);
            // TODO: we can only select 25 at a time, so slice em up
            interaction.editReply({
                content: 'OK, all set!',
                components
            });
            return;
        }
        if (role === 'night-host') {
            // TODO: save to DB
            await nightDataService.addNightData([
                {
                    day,
                    org: '',
                    role,
                    discordIdOrEmail: interaction.user.id,
                    period,
                    // both of these should be got from core data
                    timeStart: '2100',
                    timeEnd: ''
                }
            ]);
            // succcess!
            interaction.editReply({
                content: 'OK, all set!'
            });
            return;
        }
        return;
    }
}
exports.VolunteerResponseEvent = VolunteerResponseEvent;

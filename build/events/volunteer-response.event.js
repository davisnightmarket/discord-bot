"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerResponseEvent = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
// todo: split this into different events for clarity
// when a person requests a listing of
async function VolunteerResponseEvent({ nightDataService }, interaction) {
    interaction.deferReply();
    console.log('HI');
    const [command, day, role, period] = interaction?.customId?.split('--') || [];
    if (command !== 'volunteer') {
        return;
    }
    console.log(command, day, role, period);
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
                content: 'Sorry, something went wrong. We have notified the people!'
            });
            console.error('Passed not a day');
            return;
        }
        const { pickupList, hostList } = await nightDataService.getNightByDay(day);
        // role is selected in the first interaction
        if (!role) {
            interaction.editReply({
                content: 'Sorry, something went wrong. We have notified the people!'
            });
            console.error('Passed not a role.');
            return;
        }
        const roleDescription = const_1.NM_NIGHT_ROLES[role].description;
        if (!period) {
            const joinOnceButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`volunteer--${day}--${role}--once`)
                .setLabel(`${role} just this ${day}`)
                .setStyle(discord_js_1.ButtonStyle.Secondary);
            const joinAlwaysButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`volunteer--${day}--${role}--every`)
                .setLabel(`${role}  every ${day}`)
                .setStyle(discord_js_1.ButtonStyle.Secondary);
            interaction.editReply({
                content: `${roleDescription} with ${hostList
                    .map((a) => a.name)
                    .join(', ')}\nWould you like to ${const_1.NM_NIGHT_ROLES[role].description} just once, or commit to a night?\n(you can decide to commit later)`,
                components: [
                    new discord_js_1.ActionRowBuilder()
                        .addComponents(joinOnceButton)
                        .addComponents(joinAlwaysButton)
                ]
            });
            return;
        }
        // the successful select is handled above by isStringSelectMenu
        if (role === 'night-pickup') {
            console.log('NIGHT PICKUP', pickupList);
            // TODO: we can only select 25 at a time, so slice em up
            const select = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId(`volunteer--${day}--${role}--${period}--org`)
                .setPlaceholder('Make a selection!')
                .addOptions(pickupList.map(({ org, timeStart, timeEnd, personList }) => new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(org)
                .setDescription(`at ${timeStart}${personList.length ? ' with ' : ''}${personList.map((a) => a.name).join(', ')}`)
                .setValue(`${org}---${timeStart}---${timeEnd || '0000'}`)));
            interaction.editReply({
                content: 'OK, all set!',
                components: [
                    new discord_js_1.ActionRowBuilder().addComponents(select)
                ]
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

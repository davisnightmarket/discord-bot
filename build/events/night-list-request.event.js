"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightListRequestEvent = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility");
const const_1 = require("../const");
// when a person requests a listing of
async function NightListRequestEvent({ nightDataService }, interaction) {
    if (!interaction.guild) {
        interaction.reply('Hi, you can only do that on the server!');
        return;
    }
    const guild = interaction.guild;
    await interaction.deferReply();
    if (interaction.isCommand()) {
        interaction = interaction;
        let channelDay = (await guild?.channels?.fetch(interaction?.channelId ?? ''))?.name;
        channelDay = const_1.DAYS_OF_WEEK.includes(channelDay)
            ? channelDay
            : (0, utility_1.GetChannelDayToday)();
        const { pickupList } = await nightDataService.getNightByDay(channelDay);
        const components = [];
        const content = (0, utility_1.GetPickupJoinMessage)(pickupList);
        const joinOnceButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`volunteer--${channelDay}--night-host`)
            .setLabel(const_1.NM_NIGHT_ROLES['night-host'].description)
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const joinAlwaysButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`volunteer--${channelDay}--night-pickup`)
            .setLabel(const_1.NM_NIGHT_ROLES['night-pickup'].description)
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        components.push(new discord_js_1.ActionRowBuilder()
            .addComponents(joinOnceButton)
            .addComponents(joinAlwaysButton));
        interaction.editReply({
            content,
            components
        });
        return;
    }
    const [command, day, role, period] = interaction?.customId.split('--');
    console.log(command, day, role, period);
    if (command !== 'volunteer') {
        return;
    }
    if (interaction.isStringSelectMenu()) {
        // TODO: save to DB
        const [org, timeStart, timeEnd] = interaction.values[0].split('---');
        await nightDataService.updateNightData({
            day,
            org,
            role,
            discordIdOrEmail: interaction.user.id,
            period,
            timeStart,
            // both of these should be got from core data
            timeEnd: ''
        });
        interaction.editReply({
            content: interaction.values[0]
        });
    }
    // todo: replace all this with createMessageComponentCollector
    if (interaction.isButton()) {
        // some other button command
        // there should always be a day
        if (!day || !const_1.DAYS_OF_WEEK.includes(day)) {
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
                .setValue(`${org}---${timeStart}---${timeEnd}`)));
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
            await nightDataService.updateNightData({
                day,
                org: '',
                role,
                discordIdOrEmail: interaction.user.id,
                period,
                // both of these should be got from core data
                timeStart: '2100',
                timeEnd: ''
            });
            // succcess!
            interaction.editReply({
                content: 'OK, all set!'
            });
            return;
        }
        return;
    }
}
exports.NightListRequestEvent = NightListRequestEvent;

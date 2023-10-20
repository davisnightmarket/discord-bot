"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHostMessage = exports.GetNightCapMessage = exports.GetPickupsMessage = exports.GetAnnounceMessage = exports.GetPickupJoinMessage = exports.GetChannelDayYesterday = exports.GetChannelDayToday = void 0;
const discord_js_1 = require("discord.js");
const const_1 = require("../const");
// import { type NmDayNameType, type GuildServiceModel } from '../model';
// import { type PersonModel, type PickUp } from '../service';
const GetChannelDayToday = (date = new Date()) => {
    return const_1.DAYS_OF_WEEK[date.getDay()];
};
exports.GetChannelDayToday = GetChannelDayToday;
const GetChannelDayYesterday = (date = new Date()) => {
    return const_1.DAYS_OF_WEEK[date.getDay() - 1] || const_1.DAYS_OF_WEEK[6];
};
exports.GetChannelDayYesterday = GetChannelDayYesterday;
function GetPickupJoinMessage(pickupList) {
    return pickupList
        .map(({ org, timeStart, personList }) => `## ${org} at ${timeStart} with ${personList
        .map((a) => a.name)
        .join(', ')} `)
        .join('\n');
}
exports.GetPickupJoinMessage = GetPickupJoinMessage;
function GetAnnounceMessage(roleId, nightMap) {
    return (`## ${getRandoSalute()} ${(0, discord_js_1.roleMention)(roleId)}!\n` +
        '\n' +
        GetNightCapMessage(nightMap) +
        '\n' +
        GetHostMessage(nightMap) +
        '\n' +
        GetPickupsMessage(nightMap));
}
exports.GetAnnounceMessage = GetAnnounceMessage;
const saluteList = ['Hellooo', 'Holla', 'Dear', 'Dearest', 'Darling'];
function getRandoSalute() {
    return saluteList[Math.floor(Math.random() * saluteList.length)];
}
// todo: use message service
function GetPickupsMessage({ pickupList }) {
    return `Pickups\n${pickupList
        .map(({ org, timeStart, personList }) => {
        return ('>> ' +
            org +
            ' ' +
            timeStart +
            ' ' +
            personList
                .map(({ name, discordId }) => `${(0, discord_js_1.bold)(name)} ${discordId ? (0, discord_js_1.userMention)(discordId) : ''}`)
                .join(', '));
    })
        .join('\n')}`;
}
exports.GetPickupsMessage = GetPickupsMessage;
// todo: use message service
function GetNightCapMessage({ day, hostList }) {
    const nightCapList = hostList.filter((a) => a.role === 'night-captain');
    if (!nightCapList.length) {
        return 'Night Cap NEEDED! Talk to a CC';
    }
    return `Night Captain${nightCapList.length > 1 ? 's' : ''}: ${nightCapList
        .map((p) => (p.discordId ? (0, discord_js_1.userMention)(p.discordId) : p.name))
        .join(', ')}`;
}
exports.GetNightCapMessage = GetNightCapMessage;
// todo: use message service
function GetHostMessage({ hostList }) {
    const a = hostList.filter((a) => a.role === 'night-host');
    return `Host${a.length > 1 ? 's' : ''}: ${a
        .map(({ name, discordId }) => `${(0, discord_js_1.bold)(name)} ${discordId ? (0, discord_js_1.userMention)(discordId) : ''}`)
        .join(', ')} `;
}
exports.GetHostMessage = GetHostMessage;

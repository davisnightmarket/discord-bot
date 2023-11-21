"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownService = void 0;
const _1 = require(".");
const const_1 = require("../const");
const utility_1 = require("../utility");
const discord_js_1 = require("discord.js");
// TODO: make this simple to user from events
const messageMap = {
    START_HOWTO: (0, utility_1.CreateMdMessage)('START_HOWTO', {
        coreDocsList: '',
        marketDocsList: '',
        communityCoordinatorList: '',
        nightCaptainList: '',
        corePhoneNumber: '',
        marketPhoneNumber: ''
    }),
    GENERIC_OK: (0, utility_1.CreateMdMessage)('GENERIC_OK', {}),
    GENERIC_SORRY: (0, utility_1.CreateMdMessage)('GENERIC_SORRY', {
        techPhone: ''
    }),
    GENERIC_NO_PERSON: (0, utility_1.CreateMdMessage)('GENERIC_NO_PERSON', {
        techPhone: ''
    }),
    PERMISSION_LIST: (0, utility_1.CreateMdMessage)('PERMISSION_LIST', {
        permissionList: ''
    }),
    PERMISSION_EDIT: (0, utility_1.CreateMdMessage)('PERMISSION_EDIT', {}),
    AVAILABILITY_LIST: (0, utility_1.CreateMdMessage)('AVAILABILITY_LIST', {
        availabilityHostList: '',
        availabilityPickupList: ''
    }),
    AVAILABILITY_TO_PICKUP: (0, utility_1.CreateMdMessage)('AVAILABILITY_TO_PICKUP', {}),
    AVAILABILITY_TO_PICKUP_ON_DAY: (0, utility_1.CreateMdMessage)('AVAILABILITY_TO_PICKUP_ON_DAY', {
        dayName: ''
    }),
    AVAILABILITY_TO_HOST: (0, utility_1.CreateMdMessage)('AVAILABILITY_TO_HOST', {}),
    VOLUNTEER_LIST: (0, utility_1.CreateMdMessage)('VOLUNTEER_LIST', {
        dayName: '',
        dayChannelNameList: '',
        nightCapList: '',
        hostList: '',
        pickupList: '',
        myPickupList: ''
    }),
    VOLUNTEER_EDIT_ROLE: (0, utility_1.CreateMdMessage)('VOLUNTEER_EDIT_ROLE', {
        roleName: '',
        roleDescription: '',
        hostList: ''
    }),
    // VOLUNTEER_EDIT_ROLE: CreateMdMessage('VOLUNTEER_EDIT_ROLE', {
    //     roleName: '',
    //     roleDescription: '',
    //     hostNames: ''
    // }),
    FOODCOUNT_INSERT: (0, utility_1.CreateMdMessage)('FOODCOUNT_INSERT', {
        lbs: '',
        note: '',
        org: '',
        date: ''
    }),
    FOODCOUNT_INPUT_OK: (0, utility_1.CreateMdMessage)('FOODCOUNT_INPUT_OK', {
        lbs: '',
        note: '',
        org: '',
        date: '',
        seconds: ''
    }),
    FOODCOUNT_HOWTO: (0, utility_1.CreateMdMessage)('FOODCOUNT_HOWTO', {
        nightChannelNameList: '',
        foodcountExample: ''
    }),
    FOODCOUNT_REMINDER: (0, utility_1.CreateMdMessage)('FOODCOUNT_REMINDER', {
        randoSalutation: '',
        dayName: '',
        pickupOrgList: '',
        tagUserList: ''
    })
};
// message service allows us to combine core data with event data to produce messages
class MarkdownService {
    constructor(coreDataService) {
        this.coreDataService = coreDataService;
        this.md = messageMap;
    }
    // we can get any message
    getMessage(k) {
        return this.md[k];
    }
    // or write a method per message so we can combine with core or market data etc.
    async getGenericSorry() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.md.GENERIC_SORRY({
            techPhone: ''
        });
    }
    async getGenericNoPerson() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.md.GENERIC_SORRY({
            techPhone: ''
        });
    }
    getGenericBulletList(list) {
        return list.map(({ name }) => `  - ${name}`).join('\n');
    }
    getPersonBulletList(personList) {
        return personList.map(({ name }) => `  - ${name}`).join('\n');
    }
    getPersonBulletListWithPhone(personList) {
        return personList
            .map(({ name, phone }) => `  - ${name} ${phone}`)
            .join('\n');
    }
    // turns person availability strings from spreadsheet into a md list of readable day and time
    getAvailabilityListsFromPerson(person) {
        return [
            person.availabilityHostList
                .split(',')
                .filter((a) => a.trim())
                .map((a) => a
                .trim()
                .split('|||')
                .map((a) => a.trim()))
                .map((a) => `  - Host ${const_1.DAYS_OF_WEEK[a[0]]?.name} ${_1.ParseContentService.getAmPmTimeFrom24Hour(a[1])}`)
                .join('\n'),
            person.availabilityPickupList
                .split(',')
                .filter((a) => a.trim())
                .map((a) => a
                .trim()
                .split('|||')
                .map((a) => a.trim()))
                .map((a) => `  - Pick-up ${const_1.DAYS_OF_WEEK[a[0]]?.name} ${const_1.PARTS_OF_DAY[a[1]]?.name}`)
                .join('\n')
        ];
    }
    getPickupJoinMessage(pickupList) {
        return pickupList
            .map(({ org, timeStart, personList }) => `## ${org} at ${_1.ParseContentService.getAmPmTimeFrom24Hour(timeStart)} with ${personList.map((a) => a.name).join(', ')} `)
            .join('\n');
    }
    getNightOpsEphemeral(day, discordId, nightMap) {
        return (`## ${const_1.DAYS_OF_WEEK[day].name}:\n` +
            '\n' +
            this.getNightCapEphemeral(discordId, nightMap) +
            '\n' +
            this.getDistroEphemeral(discordId, nightMap) +
            '\n' +
            this.getPickupsEphemeral(discordId, nightMap));
    }
    getNightOpsAnnounce(roleId, nightMap) {
        return (`## ${(0, discord_js_1.roleMention)(roleId)}\n` +
            '\n' +
            this.getNightCapAnnounce(nightMap) +
            '\n' +
            this.getDistroAnnounce(nightMap) +
            '\n' +
            this.getPickupsAnnounce(nightMap) +
            '\n\n Love, Crabapple');
    }
    getRandoChannelSalute(channelName) {
        const saluteList = [
            `Pardon Me ${(0, discord_js_1.roleMention)(channelName)}, my dear ol' chap,`,
            `Dearest Darling ${(0, discord_js_1.roleMention)(channelName)},`,
            `Sup ${(0, discord_js_1.roleMention)(channelName)} Dogz`
        ];
        return saluteList[Math.floor(Math.random() * saluteList.length)];
    }
    // todo: use message service
    getAfterMarketAnnounce(roleId, { pickupList }) {
        return `## ${(0, discord_js_1.roleMention)(roleId)}!\nNight herstory has been recorded! New night list: ${pickupList
            .map(({ org, timeStart, personList }) => {
            return ('\n>' +
                org +
                ' ' +
                _1.ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                ' ' +
                personList
                    .map(({ name, discordId }) => `${(0, discord_js_1.bold)(name)} ${discordId ? (0, discord_js_1.userMention)(discordId) : ''}`)
                    .join(', '));
        })
            .join('\n')}`;
    }
    getPickupsAnnounce({ pickupList }) {
        return `Pick-up${pickupList.length === 1 ? '' : 's'}: ${pickupList.map(({ org, timeStart, personList }) => {
            return ('\n> ' +
                org +
                ' ' +
                _1.ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                ' ' +
                personList
                    .map(({ name, discordId }) => `${(0, discord_js_1.bold)(name)} ${discordId ? (0, discord_js_1.userMention)(discordId) : ''}`)
                    .join(', '));
        })}`;
    }
    getNightCapAnnounce({ hostList, statusList }) {
        // todo: this logic needs improvement
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');
        if (statusList.includes('NEEDED_CAP')) {
            return 'Night Cap NEEDED!';
        }
        return `Night Captain${nightCapList.length === 1 ? '' : 's'}: ${nightCapList
            .map((p) => (p.discordId ? (0, discord_js_1.userMention)(p.discordId) : p.name))
            .join(', ')}`;
    }
    // todo: use message service
    getDistroAnnounce({ hostList, statusList }) {
        if (statusList.includes('NEEDED_DISTRO')) {
            return 'Distro help NEEDED!';
        }
        const a = hostList.filter((a) => a.role === 'night-distro');
        return `Host${a.length > 1 ? 's' : ''}: ${a
            .map(({ name, discordId }) => `${discordId ? (0, discord_js_1.userMention)(discordId) : (0, discord_js_1.bold)(name)}`)
            .join(', ')} `;
    }
    getMyPickups(discordId, { pickupList }) {
        return `Current pick-up${pickupList.length === 1 ? '' : 's'}:${pickupList
            .filter((a) => a.personList.some((b) => b.discordIdOrEmail === discordId))
            .map(({ org, timeStart, personList }) => {
            return ('\n> ' +
                org +
                ' ' +
                _1.ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                ' ' +
                personList
                    .map((a) => `${discordId
                    ? (0, discord_js_1.userMention)(a.discordId)
                    : (0, discord_js_1.bold)(a.name)} ${a.periodStatus === 'SHADOW'
                    ? '(Shadow Mode)'
                    : ''}`)
                    .join(', '));
        })}`;
    }
    getPickupsEphemeral(discordId, { pickupList, statusList }) {
        return `Pick-up${pickupList.length === 1 ? '' : 's'}${statusList.includes('NEEDED_PICKUP') ? ' HELP NEEDED' : ''}:${pickupList.map(({ org, timeStart, personList }) => {
            return ('\n> ' +
                org +
                ' ' +
                _1.ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                ' ' +
                personList
                    .map((a) => `${(0, discord_js_1.bold)(a.name)} ${discordId === a.discordId
                    ? `(YOU${a.periodStatus === 'SHADOW'
                        ? ', Shadow Mode'
                        : ''})`
                    : ''}`)
                    .join(', '));
        })}`;
    }
    getNightCapEphemeral(discordId, { hostList, statusList }) {
        if (statusList.includes('NEEDED_CAP')) {
            return 'Night Cap: HELP NEEDED!';
        }
        // todo: this logic needs improvement
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');
        return `Night Captain${nightCapList.length > 1 ? 's' : ''}: ${nightCapList
            .map((a) => `${(0, discord_js_1.bold)(a.name)} ${discordId === a.discordId
            ? `(YOU${a.periodStatus === 'SHADOW'
                ? ', Shadow Mode'
                : ''})`
            : ''}`)
            .join(', ')}`;
    }
    // todo: use message service
    getDistroEphemeral(discordId, { hostList, statusList }) {
        if (statusList.includes('NEEDED_DISTRO')) {
            return 'Distro: HELP NEEDED!';
        }
        const a = hostList.filter((a) => a.role === 'night-distro');
        return `Host${a.length === 1 ? '' : 's'}: ${a
            .map((a) => `${(0, discord_js_1.bold)(a.name)} ${discordId === a.discordId
            ? `(YOU${a.periodStatus === 'SHADOW'
                ? ', Shadow Mode'
                : ''})`
            : ''}`)
            .join(', ')} `;
    }
}
exports.MarkdownService = MarkdownService;

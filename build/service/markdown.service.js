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
    AVAILABILITY_TO_PICKUP: (0, utility_1.CreateMdMessage)('AVAILABILITY_TO_PICKUP', {
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
            person.availabilityHost
                .split(',')
                .map((a) => a
                .trim()
                .split('|||')
                .map((a) => a.trim()))
                .map((a) => `  - Host ${const_1.DAYS_OF_WEEK[a[0]].name} ${_1.ParseContentService.getAmPmTimeFrom24Hour(a[1])}`)
                .join('\n'),
            person.availabilityPickup
                .split(',')
                .map((a) => a
                .trim()
                .split('|||')
                .map((a) => a.trim()))
                .map((a) => `  - Pick-up ${const_1.DAYS_OF_WEEK[a[0]].name} ${const_1.PARTS_OF_DAY[a[1]].name}`)
                .join('\n')
        ];
    }
    getPickupJoinMessage(pickupList) {
        return pickupList
            .map(({ org, timeStart, personList }) => `## ${org} at ${timeStart} with ${personList
            .map((a) => a.name)
            .join(', ')} `)
            .join('\n');
    }
    getAnnounceMessage(roleId, nightMap) {
        return (`## ${this.getRandoSalute()} ${(0, discord_js_1.roleMention)(roleId)}!\n` +
            '\n' +
            this.getNightCapMessage(nightMap) +
            '\n' +
            this.getHostMessage(nightMap) +
            '\n' +
            this.getPickupsMessage(nightMap));
    }
    getRandoSalute() {
        const saluteList = [
            'Hellooo',
            'Holla',
            'Dear',
            'Dearest',
            'Darling'
        ];
        return saluteList[Math.floor(Math.random() * saluteList.length)];
    }
    // todo: use message service
    getAfterMarketMessage(roleId, { pickupList }) {
        return `## ${(0, discord_js_1.roleMention)(roleId)}!\nNight herstory has been recorded! New night list: \n${pickupList
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
    // todo: use message service
    getPickupsMessage({ pickupList }) {
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
    // todo: use message service
    getNightCapMessage({ day, hostList }) {
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');
        if (!nightCapList.length) {
            return 'Night Cap NEEDED! Talk to a CC';
        }
        return `Night Captain${nightCapList.length > 1 ? 's' : ''}: ${nightCapList
            .map((p) => (p.discordId ? (0, discord_js_1.userMention)(p.discordId) : p.name))
            .join(', ')}`;
    }
    // todo: use message service
    getHostMessage({ hostList }) {
        const a = hostList.filter((a) => a.role === 'night-host');
        return `Host${a.length > 1 ? 's' : ''}: ${a
            .map(({ name, discordId }) => `${(0, discord_js_1.bold)(name)} ${discordId ? (0, discord_js_1.userMention)(discordId) : ''}`)
            .join(', ')} `;
    }
}
exports.MarkdownService = MarkdownService;

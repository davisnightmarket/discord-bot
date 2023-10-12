"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownService = void 0;
const _1 = require(".");
const const_1 = require("../const");
const utility_1 = require("../utility");
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
        contactTextOnList: '',
        contactEmailOnList: '',
        sharePhoneOnList: '',
        shareEmailOnList: ''
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
    VOLUNTEER_ONCE_OR_COMMIT: (0, utility_1.CreateMdMessage)('VOLUNTEER_ONCE_OR_COMMIT', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    VOLUNTEER_AS_ROLE: (0, utility_1.CreateMdMessage)('VOLUNTEER_AS_ROLE', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
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
}
exports.MarkdownService = MarkdownService;

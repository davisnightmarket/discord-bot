"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const utility_1 = require("../utility");
// TODO: make this simple to user from events
const messageMap = {
    GENERIC_OK: (0, utility_1.CreateMessage)('GENERIC_OK', {}),
    GENERIC_SORRY: (0, utility_1.CreateMessage)('GENERIC_SORRY', {
        techPhone: ''
    }),
    GENERIC_NO_PERSON: (0, utility_1.CreateMessage)('GENERIC_NO_PERSON', {
        techPhone: ''
    }),
    AVAILABILITY_TO_PICKUP: (0, utility_1.CreateMessage)('AVAILABILITY_TO_PICKUP', {
        dayName: ''
    }),
    AVAILABILITY_TO_HOST: (0, utility_1.CreateMessage)('AVAILABILITY_TO_HOST', {}),
    VOLUNTEER_ONCE_OR_COMMIT: (0, utility_1.CreateMessage)('VOLUNTEER_ONCE_OR_COMMIT', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    VOLUNTEER_AS_ROLE: (0, utility_1.CreateMessage)('VOLUNTEER_AS_ROLE', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    FOODCOUNT_HOWTO: (0, utility_1.CreateMessage)('FOODCOUNT_HOWTO', {
        nightChannelNameList: '',
        foodcountExample: ''
    }),
    FOODCOUNT_REMINDER: (0, utility_1.CreateMessage)('FOODCOUNT_REMINDER', {
        randoSalutation: '',
        dayName: '',
        pickupOrgList: '',
        tagUserList: ''
    })
};
// message service allows us to combine core data with event data to produce messages
class MessageService {
    constructor(coreDataService) {
        this.coreDataService = coreDataService;
        this.m = messageMap;
    }
    // we can get any message
    getMessage(k) {
        return this.m[k];
    }
    // or write a method per message so we can combine with core or market data etc.
    async getGenericSorry() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.m.GENERIC_SORRY({
            techPhone: ''
        });
    }
    async getGenericNoPerson() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.m.GENERIC_SORRY({
            techPhone: ''
        });
    }
}
exports.MessageService = MessageService;

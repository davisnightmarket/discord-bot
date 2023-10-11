"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const utility_1 = require("../utility");
// TODO: make this simple to user from events
// type MessageType =
//     | 'AVAILABILITY_PERIOD'
//     | 'FOODCOUNT_INPUT_FAIL'
//     | 'FOODCOUNT_INPUT_OK'
//     | 'FOODCOUNT_INSERT'
//     | 'GENERIC_SORRY'
//     | 'NIGHT_CAP_NEEDED'
//     | 'PERSON_FIRST_CONTACT'
//     | 'PERSON_REQUEST_EMAIL_AGAIN'
//     | 'PERSON_REQUEST_EMAIL_DECLINE'
//     | 'PERSON_REQUEST_EMAIL_FAIL'
//     | 'PERSON_REQUEST_EMAIL_OK'
//     | 'PERSON_REQUEST_EMAIL'
//     | 'PERSON_REQUEST_PHONE_AGAIN'
//     | 'PERSON_REQUEST_PHONE_OK'
//     | 'PERSON_REQUEST_PHONE';
const messageMap = {
    GENERIC_SORRY: (0, utility_1.CreateMessage)('GENERIC_SORRY', {
        techPhone: ''
    }),
    AVAILABILITY_PERIOD: (0, utility_1.CreateMessage)('AVAILABILITY_PERIOD', { test: '' }),
    VOLUNTEER_ONCE_OR_COMMIT: (0, utility_1.CreateMessage)('VOLUNTEER_ONCE_OR_COMMIT', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    VOLUNTEER_AS_ROLE: (0, utility_1.CreateMessage)('VOLUNTEER_AS_ROLE', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    })
};
messageMap.AVAILABILITY_PERIOD({ test: '' });
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
    getGenericSorry() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.m.GENERIC_SORRY({
            techPhone: ''
        });
    }
}
exports.MessageService = MessageService;

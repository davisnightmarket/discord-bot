import { type CoreDataService } from '.';
import { CreateMessage } from '../utility';

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
    GENERIC_SORRY: CreateMessage('GENERIC_SORRY', {
        techPhone: ''
    }),
    AVAILABILITY_PERIOD: CreateMessage('AVAILABILITY_PERIOD', { test: '' }),
    VOLUNTEER_ONCE_OR_COMMIT: CreateMessage('VOLUNTEER_ONCE_OR_COMMIT', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    VOLUNTEER_AS_ROLE: CreateMessage('VOLUNTEER_AS_ROLE', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    })
};

messageMap.AVAILABILITY_PERIOD({ test: '' });
// message service allows us to combine core data with event data to produce messages
export class MessageService {
    coreDataService: CoreDataService;
    m: typeof messageMap;

    constructor(coreDataService: CoreDataService) {
        this.coreDataService = coreDataService;

        this.m = messageMap;
    }
    // we can get any message
    getMessage<U extends keyof typeof messageMap>(k: U) {
        return this.m[k] as (typeof messageMap)[typeof k];
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

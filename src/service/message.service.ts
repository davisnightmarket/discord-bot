import { type CoreDataService } from '.';
import { CreateMessage } from '../utility';

// TODO: make this simple to user from events

const messageMap = {
    START_HOWTO: CreateMessage<
        'START_HOWTO',
        {
            coreLinkList: string[];
            marketLinkList: string[];
        }
    >('START_HOWTO', {
        coreLinkList: [],
        marketLinkList: []
    }),
    GENERIC_OK: CreateMessage('GENERIC_OK', {}),
    GENERIC_SORRY: CreateMessage('GENERIC_SORRY', {
        techPhone: ''
    }),
    GENERIC_NO_PERSON: CreateMessage('GENERIC_NO_PERSON', {
        techPhone: ''
    }),
    AVAILABILITY_LIST: CreateMessage<
        'AVAILABILITY_LIST',
        {
            availabilityHostList: string[];
            availabilityPickupList: string[];
        }
    >('AVAILABILITY_LIST', {
        availabilityHostList: [],
        availabilityPickupList: []
    }),
    AVAILABILITY_TO_PICKUP: CreateMessage('AVAILABILITY_TO_PICKUP', {
        dayName: ''
    }),
    AVAILABILITY_TO_HOST: CreateMessage('AVAILABILITY_TO_HOST', {}),
    VOLUNTEER_ONCE_OR_COMMIT: CreateMessage('VOLUNTEER_ONCE_OR_COMMIT', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    VOLUNTEER_AS_ROLE: CreateMessage('VOLUNTEER_AS_ROLE', {
        roleName: '',
        roleDescription: '',
        hostNames: ''
    }),
    FOODCOUNT_HOWTO: CreateMessage('FOODCOUNT_HOWTO', {
        nightChannelNameList: '',
        foodcountExample: ''
    }),
    FOODCOUNT_REMINDER: CreateMessage('FOODCOUNT_REMINDER', {
        randoSalutation: '',
        dayName: '',
        pickupOrgList: '',
        tagUserList: ''
    })
};

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

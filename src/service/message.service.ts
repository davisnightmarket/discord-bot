import { CreateMessageMap } from '../utility';
import { CoreDataService } from '.';

// TODO: make this simple to user from events

type MessageType =
    | 'AVAILABILITY_PERIOD'
    | 'FOODCOUNT_INPUT_FAIL'
    | 'FOODCOUNT_INPUT_OK'
    | 'FOODCOUNT_INSERT'
    | 'GENERIC_SORRY'
    | 'NIGHT_CAP_NEEDED'
    | 'PERSON_FIRST_CONTACT'
    | 'PERSON_REQUEST_EMAIL_AGAIN'
    | 'PERSON_REQUEST_EMAIL_DECLINE'
    | 'PERSON_REQUEST_EMAIL_FAIL'
    | 'PERSON_REQUEST_EMAIL_OK'
    | 'PERSON_REQUEST_EMAIL'
    | 'PERSON_REQUEST_PHONE_AGAIN'
    | 'PERSON_REQUEST_PHONE_OK'
    | 'PERSON_REQUEST_PHONE';

const messageMap = CreateMessageMap({
    GENERIC_SORRY: {
        techPhone: ''
    }
});

export class MessageService {
    coreDataService: CoreDataService;

    constructor(coreDataService: CoreDataService) {
        this.coreDataService = coreDataService;
    }
    getGenericSorry() {
        // TODO: figure out how to do this
        return messageMap.GENERIC_SORRY({ techPhone: '' });
    }
}

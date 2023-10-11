import { Dbg } from './debug.utility';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

type MessageCodeType =
    | 'GENERIC_OK'
    | 'GENERIC_NO_PERSON'
    | 'GENERIC_SORRY'
    | 'AVAILABILITY_TO_HOST'
    | 'AVAILABILITY_TO_PICKUP'
    | 'VOLUNTEER_AS_ROLE'
    | 'VOLUNTEER_ONCE_OR_COMMIT'
    | 'FOODCOUNT_INPUT_FAIL'
    | 'FOODCOUNT_INPUT_OK'
    | 'FOODCOUNT_INSERT'
    | 'FOODCOUNT_HOWTO'
    | 'FOODCOUNT_REMINDER'
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

type MessageCoreParamType = {};

const dbg = Dbg('MessageUtility');

const messageCache: Record<string, string> = {};

const messagePath = join(__dirname, '/../message-md');

function loadMessage(id: string, reload: boolean = false) {
    if (messageCache[id] && !reload) {
        return messageCache[id];
    }

    try {
        // todo, we want to process with markdown
        messageCache[id] = readFileSync(join(messagePath, id + '.md'), 'utf-8');
    } catch (e) {
        // todo: set up a proper logger and send notifications in prod
        if (process.env.NODE_ENV === 'prod') {
            console.error(e);
        } else {
            dbg(e);
        }
    }
    return messageCache[id];
}

function loadAllMessage(
    a: string[],
    reload: boolean = false
): Record<string, string> {
    const c: Record<string, string> = {};
    try {
        for (const b of a) {
            c[b] = loadMessage(b, reload);
        }
    } catch (e) {
        dbg(e);
    }
    return c;
}

export function CreateMessage<
    T extends MessageCodeType,
    U extends MessageCoreParamType
>(messageCode: T, coreParams: U): (a: U) => string {
    const message = loadMessage(messageCode) as Record<keyof U, string>;
    // because we do not want a message compile error to break teh app
    let d: HandlebarsTemplateDelegate;
    try {
        d = Handlebars.compile(message ?? '');
    } catch (e) {
        d = Handlebars.compile('');
        console.error(e);
    }

    return (c: U) => {
        let msg = '';
        try {
            msg = d({ ...coreParams, ...c });
        } catch (e) {
            console.error(e);
        }
        return msg;
    };
}

export function CreateMessageMap<
    U extends Record<string, Record<string, string>>
>(map: Partial<U>) {
    const messageMap = loadAllMessage(Object.keys(map)) as Record<
        keyof U,
        string
    >;

    // todo: parse with HBS
    return Object.keys(messageMap).reduce<
        Partial<Record<keyof U, (a: U[keyof U]) => string>>
    >((a, b: keyof U) => {
        // because we do not want a message compile error to break teh app
        let d = Handlebars.compile('');
        try {
            d = Handlebars.compile(messageMap[b] ?? '');
        } catch (e) {
            console.error(e);
        }

        a[b] = (c: U[typeof b]) => {
            let msg = '';
            try {
                msg = d({ ...map[b], ...c });
            } catch (e) {
                console.error(e);
            }
            return msg;
        };
        return a;
    }, {}) as Record<keyof U, (a: U[keyof U]) => string>;
}

import { readFileSync } from 'fs';
import { join } from 'path';
import { Dbg } from './debug.utility';
import Handlebars from 'handlebars';

const dbg = Dbg('MessageService');

const messageCache: Record<string, string> = {};

const messagePath = join(__dirname, '/../message/md');

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

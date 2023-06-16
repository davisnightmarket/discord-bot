import { readFileSync } from 'fs';
import { join } from 'path';
import { Dbg } from './debug.service';
import Handlebars from 'handlebars';

const dbg = Dbg('MessageService');

const messageCache: {
    [k in string]: string;
} = {};

const messagePath = join(__dirname, '/../message-md');

export class MessageService {
    static loadMessage(id: string, reload: boolean = false) {
        if (messageCache[id] && !reload) {
            return messageCache[id];
        }

        try {
            // todo, we want to process with markdown
            messageCache[id] = readFileSync(
                join(messagePath, id + '.md'),
                'utf-8'
            );
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

    static loadAllMessage(
        a: string[],
        reload: boolean = false
    ): { [k in string]: string } {
        const c: {
            [k in string]: string;
        } = {};
        try {
            for (const b of a) {
                c[b] = this.loadMessage(b, reload);
            }
        } catch (e) {
            dbg(e);
        }
        return c;
    }

    static createMap<
        U extends {
            [k in string]: { [k in string]: string };
        }
    >(map: U) {
        const messageMap = MessageService.loadAllMessage(Object.keys(map)) as {
            [k in keyof U]: string;
        };

        // todo: parse with HBS
        return Object.keys(messageMap).reduce<{
            [k in keyof U]: (a: U[k]) => string;
        }>((a, b: keyof U) => {
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
        }, {}) as {
                [k in keyof U]: (a: U[k]) => string;
            };
    }
}

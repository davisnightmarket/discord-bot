import { Dbg } from './debug.utility';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

type MessageCodeType =
    | 'START_HOWTO'
    | 'AVAILABILITY_LIST'
    | 'PERMISSION_LIST'
    | 'PERMISSION_EDIT'
    | 'GENERIC_OK'
    | 'GENERIC_NO_PERSON'
    | 'GENERIC_SORRY'
    | 'AVAILABILITY_TO_HOST'
    | 'AVAILABILITY_TO_PICKUP'
    | 'AVAILABILITY_TO_PICKUP_ON_DAY'
    | 'VOLUNTEER_LIST'
    | 'VOLUNTEER_EDIT_ROLE'
    | 'VOLUNTEER_EDIT_PERIOD'
    | 'VOLUNTEER_EDIT_HOST'
    | 'VOLUNTEER_EDIT_PICKUP'
    | 'FOODCOUNT_INPUT_FAIL'
    | 'FOODCOUNT_INPUT_OK'
    | 'FOODCOUNT_INSERT'
    | 'FOODCOUNT_HOWTO'
    | 'FOODCOUNT_REMINDER'
    | 'NIGHT_CAP_NEEDED'
    | 'START_WELCOME';

type MessageCoreParamType = {};

const dbg = Dbg('MessageUtility');

const messageCache: Record<string, string> = {};

const messagePath = join(__dirname, '/../message-md');

function loadMessage(id: string, reload: boolean = false) {
    if (messageCache[id] && !reload) {
        return messageCache[id];
    }

    const errorList: string[] = [];
    try {
        // todo, we want to process with markdown
        messageCache[id] = readFileSync(join(messagePath, id + '.md'), 'utf-8');
    } catch (e) {
        // todo: set up a proper logger and send notifications in prod
        errorList.push(`No .md file for ${join(messagePath, id + '.md')}`);
    }
    try {
        if (!messageCache[id]) {
            messageCache[id] = readFileSync(
                join(messagePath, id + '.hbs'),
                'utf-8'
            );
        }
    } catch (e) {
        errorList.push(`No .md file for ${join(messagePath, id + '.hbs')}`);
    }

    // TODO: also look for core and market markdown files from google drive

    if (!messageCache[id]) {
        dbg(errorList);
        // todo: send this to the logger for letting devs know
        console.error(`Missing content for ${join(messagePath, id + '.hbs')}`);
    }
    return messageCache[id] || '';
}

export function CreateMdMessage<
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

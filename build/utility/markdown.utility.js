"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMdMessage = void 0;
const debug_utility_1 = require("./debug.utility");
const fs_1 = require("fs");
const path_1 = require("path");
const handlebars_1 = __importDefault(require("handlebars"));
const dbg = (0, debug_utility_1.Dbg)('MessageUtility');
const messageCache = {};
const messagePath = (0, path_1.join)(__dirname, '/../message-md');
function loadMessage(id, reload = false) {
    if (messageCache[id] && !reload) {
        return messageCache[id];
    }
    try {
        // todo, we want to process with markdown
        messageCache[id] = (0, fs_1.readFileSync)((0, path_1.join)(messagePath, id + '.md'), 'utf-8');
    }
    catch (e) {
        // todo: set up a proper logger and send notifications in prod
        if (process.env.NODE_ENV === 'prod') {
            console.error(e);
        }
        else {
            dbg(e);
        }
    }
    try {
        if (!messageCache[id]) {
            messageCache[id] = (0, fs_1.readFileSync)((0, path_1.join)(messagePath, id + '.hbs'), 'utf-8');
        }
    }
    catch (e) {
        // todo: set up a proper logger and send notifications in prod
        if (process.env.NODE_ENV === 'prod') {
            console.error(e);
        }
        else {
            dbg(e);
        }
    }
    return messageCache[id];
}
function loadAllMessage(a, reload = false) {
    const c = {};
    try {
        for (const b of a) {
            c[b] = loadMessage(b, reload);
        }
    }
    catch (e) {
        dbg(e);
    }
    return c;
}
function CreateMdMessage(messageCode, coreParams) {
    const message = loadMessage(messageCode);
    // because we do not want a message compile error to break teh app
    let d;
    try {
        d = handlebars_1.default.compile(message ?? '');
    }
    catch (e) {
        d = handlebars_1.default.compile('');
        console.error(e);
    }
    return (c) => {
        let msg = '';
        try {
            msg = d({ ...coreParams, ...c });
        }
        catch (e) {
            console.error(e);
        }
        return msg;
    };
}
exports.CreateMdMessage = CreateMdMessage;
// deprecated because we can't get the props typed
// export function CreateMessageMap<
//     U extends Record<string, Record<string, string>>
// >(map: Partial<U>) {
//     const messageMap = loadAllMessage(Object.keys(map)) as Record<
//         keyof U,
//         string
//     >;
//     // todo: parse with HBS
//     return Object.keys(messageMap).reduce<
//         Partial<Record<keyof U, (a: U[keyof U]) => string>>
//     >((a, b: keyof U) => {
//         // because we do not want a message compile error to break teh app
//         let d = Handlebars.compile('');
//         try {
//             d = Handlebars.compile(messageMap[b] ?? '');
//         } catch (e) {
//             console.error(e);
//         }
//         a[b] = (c: U[typeof b]) => {
//             let msg = '';
//             try {
//                 msg = d({ ...map[b], ...c });
//             } catch (e) {
//                 console.error(e);
//             }
//             return msg;
//         };
//         return a;
//     }, {}) as Record<keyof U, (a: U[keyof U]) => string>;
// }

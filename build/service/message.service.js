"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const debug_utility_1 = require("../utility/debug.utility");
const handlebars_1 = __importDefault(require("handlebars"));
const dbg = (0, debug_utility_1.Dbg)('MessageService');
const messageCache = {};
const messagePath = (0, path_1.join)(__dirname, '/../message-md');
// TODO: do we want massage service to get it's messages from a google drive folder?
// if so, then we want this to be a service that takes the id of the folder in the constructor
class MessageService {
    static loadMessage(id, reload = false) {
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
        return messageCache[id];
    }
    static loadAllMessage(a, reload = false) {
        const c = {};
        try {
            for (const b of a) {
                c[b] = this.loadMessage(b, reload);
            }
        }
        catch (e) {
            dbg(e);
        }
        return c;
    }
    static createMap(map) {
        const messageMap = MessageService.loadAllMessage(Object.keys(map));
        // todo: parse with HBS
        return Object.keys(messageMap).reduce((a, b) => {
            // because we do not want a message compile error to break teh app
            let d = handlebars_1.default.compile('');
            try {
                d = handlebars_1.default.compile(messageMap[b] ?? '');
            }
            catch (e) {
                console.error(e);
            }
            a[b] = (c) => {
                let msg = '';
                try {
                    msg = d({ ...map[b], ...c });
                }
                catch (e) {
                    console.error(e);
                }
                return msg;
            };
            return a;
        }, {});
    }
}
exports.MessageService = MessageService;

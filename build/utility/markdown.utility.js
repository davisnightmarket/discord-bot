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
    const errorList = [];
    try {
        // todo, we want to process with markdown
        messageCache[id] = (0, fs_1.readFileSync)((0, path_1.join)(messagePath, id + '.md'), 'utf-8');
    }
    catch (e) {
        // todo: set up a proper logger and send notifications in prod
        errorList.push(`No .md file for ${(0, path_1.join)(messagePath, id + '.md')}`);
    }
    try {
        if (!messageCache[id]) {
            messageCache[id] = (0, fs_1.readFileSync)((0, path_1.join)(messagePath, id + '.hbs'), 'utf-8');
        }
    }
    catch (e) {
        errorList.push(`No .md file for ${(0, path_1.join)(messagePath, id + '.hbs')}`);
    }
    // TODO: also look for core and market markdown files from google drive
    if (!messageCache[id]) {
        dbg(errorList);
        // todo: send this to the logger for letting devs know
        console.error(`Missing content for ${(0, path_1.join)(messagePath, id + '.hbs')}`);
    }
    return messageCache[id] || '';
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

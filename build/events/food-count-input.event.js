"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountInputEvent = exports.TIME_UNTIL_UPDATE = exports.FoodCountInputCache = void 0;
const discord_js_1 = require("discord.js");
const nm_service_1 = require("../nm-service");
const uuid_1 = require("uuid");
const index_1 = require("../service/index");
const utility_1 = require("../utility");
const discord_service_1 = require("../service/discord.service");
const debug = (0, utility_1.Dbg)('FoodCountInputEvent');
const MsgReply = index_1.MessageService.createMap({
    // message sent when someone posts a food count event
    FOODCOUNT_INSERT: {
        lbs: '',
        note: '',
        org: '',
        date: ''
    },
    // message sent when a food count gets stuck in the db successfully
    FOODCOUNT_INPUT_OK: {
        lbs: '',
        note: '',
        org: '',
        date: '',
        seconds: ''
    }
});
// this is a cache for food-count input so that we can
// give user a set period of time to cancel
// if the user cancels, this cache is deleted
// if not, it is inserted into the spreadsheet
exports.FoodCountInputCache = (0, utility_1.CacheUtility)('food-count');
// after a set period of time, the input is inserted. this is that time:
exports.TIME_UNTIL_UPDATE = 60 * 1000; // one minute in milliseconds
/**
 *
 */
const FoodCountInputEvent = (guildService) => (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { channel, author } = message;
    if (!((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id)) {
        (0, utility_1.Dbg)('FoodCountInputEvent does not happen outside of a guild channel');
        return;
    }
    const { personCoreService, foodCountInputInstanceService, foodCountDataInstanceService } = guildService[(_b = message.guild) === null || _b === void 0 ? void 0 : _b.id];
    /* STAGE 1: skip the message entirely in some cases */
    // if we are a bot, we do not want to process the message
    if (author.bot ||
        // this does not match the published api. there it is a string: "DM"
        // in any case we do not want to continue if this is a direct message
        channel.type === 1) {
        return;
    }
    let { content } = message;
    // make sure there is some actual content
    // this is probably not needed since Discord does not send blanks but it's cheap so leaving it
    if (!(content = content.trim())) {
        return;
    }
    /* STAGE 2: figure out our input status */
    const [channelStatus, inputStatus, 
    // did we get the date from the content, from the channel name, or just today by default?
    dateStatus, date, parsedInputList, parsedInputErrorList] = yield foodCountInputInstanceService.getParsedChannelAndContent(channel.name, content);
    // if we are not in a night or count channel
    // we do not send a message, we simply get out
    if (channelStatus === 'INVALID_CHANNEL') {
        return;
    }
    // because when we have an invalid input, and we are in the count channel ...
    if (inputStatus === 'INVALID' && channelStatus === 'COUNT_CHANNEL') {
        // we want to tell them that they cannot put invalid content in the count channel
        return;
    }
    // because when we have an invalid input, and we are in the night channel ...
    if (inputStatus === 'INVALID' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to nothing, because this is probably not a count
        return;
    }
    // because when we have only errors, and we are in the night channel ...
    if (inputStatus === 'ONLY_ERRORS' &&
        channelStatus === 'NIGHT_CHANNEL') {
        // we want to ask them nicely if they meant to do a count at all
        // ? perhaps we want a a separate cache for this case and let them confirm?
        return;
    }
    // because when we have some errors, and we are in the night channel ...
    if (inputStatus === 'OK_WITH_ERRORS' &&
        channelStatus === 'NIGHT_CHANNEL') {
        // we want to ask them nicely if they meant to do a count
        // because we do not assume that we are doing a count in this case ?
        // ? perhaps we want a a separate cache for this case and let them confirm?
        // ? we might also want to check what kind of errors? because if they do not have lbs, maybe we assume they did not mean to count
        return;
    }
    // because when we have only errors, and we are in the count channel ...
    if (inputStatus === 'ONLY_ERRORS' &&
        channelStatus === 'COUNT_CHANNEL') {
        // we want to show them their errors, ask if they meant to do it
        return;
    }
    /* OK, loop over the food count input */
    // ? we can do two loops, one for successful input, one for unsuccessful
    for (const { lbs, org, note } of parsedInputList) {
        // we need a unique id for our cache
        const cacheId = (0, uuid_1.v4)();
        // now we create our insert event
        const insertTimeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            // we need to make sure teh count has not been cancelled
            // todo: test this
            if (exports.FoodCountInputCache.get(cacheId) == null) {
                return;
            }
            // todo: try/catch
            yield foodCountDataInstanceService.appendFoodCount({
                org,
                date,
                reporter,
                lbs,
                note
            });
            // we want to post to food-count, always, so folks know what's in the db
            const countChannel = (0, discord_service_1.getChannelByName)(message, nm_service_1.COUNT_CHANNEL_NAME);
            countChannel === null || countChannel === void 0 ? void 0 : countChannel.send(MsgReply.FOODCOUNT_INSERT({
                lbs: `${lbs}`,
                note,
                org,
                date
            })
            //                     `*OK, posted to db:*
            // ${lbs} lbs ${note ? `(${note})` : ''} from ${org} on  ${date}.`
            );
            try {
                exports.FoodCountInputCache.delete(cacheId);
                yield messageReply.delete();
            }
            catch (e) {
                console.log(e);
            }
        }), 
        // we give them a certain amount of time to hit cancel
        exports.TIME_UNTIL_UPDATE);
        // create our cache
        exports.FoodCountInputCache.add(cacheId, {
            status: 'INSERT_UNLESS_CANCEL',
            messageInputId: message.id,
            messageResponseId: '',
            messageCountId: '',
            stamp: Date.now() / 1000,
            insertTimeout
        });
        // our success message
        const reply = {
            content: MsgReply.FOODCOUNT_INPUT_OK({
                lbs: `${lbs}`,
                note,
                org,
                date,
                seconds: `${exports.TIME_UNTIL_UPDATE / 1000}`
            }),
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    // we keep the cacheId on the custom id so we can delete it on cancel event
                    .setCustomId(`food-count-cancel--${cacheId}`)
                    .setLabel('delete')
                    .setStyle(discord_js_1.ButtonStyle.Danger))
            ]
        };
        // we need a reference to the message
        const messageReply = yield message.reply(reply);
        // because we want to delete this message on cancel, or when the expiration passes
        // we save the reply id
        exports.FoodCountInputCache.update(cacheId, {
            messageResponseId: messageReply.id
        });
        // get our reporter email address
        const reporter = (_c = (yield personCoreService.getEmailByDiscordId(author.id))) !== null && _c !== void 0 ? _c : '';
    }
    // loop over errors and post to channel
    for (const { status, lbs, org, orgFuzzy } of parsedInputErrorList) {
        let content = '';
        if (status === 'NO_LBS_OR_ORG') {
            content =
                foodCountInputInstanceService.getMessageErrorNoLbsOrOrg({
                    messageContent: message.content
                });
        }
        if (status === 'NO_LBS') {
            content = foodCountInputInstanceService.getMessageErrorNoLbs({
                org
            });
        }
        if (status === 'NO_ORG') {
            content = foodCountInputInstanceService.getMessageErrorNoOrg({
                orgFuzzy,
                lbs
            });
        }
        const responseMessage = yield message.reply({
            content
        });
        // we delete crabapple message after 1 minute
        //  todo: make this better
        setTimeout(() => {
            // ? we only delete their message if they are in food count channel??
            if (channelStatus === 'COUNT_CHANNEL') {
                message.delete();
            }
            // always delete our own message
            responseMessage.delete();
        }, exports.TIME_UNTIL_UPDATE);
    }
});
exports.FoodCountInputEvent = FoodCountInputEvent;

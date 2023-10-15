"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountDeleteButtonEvent = void 0;
const _1 = require("./");
const service_1 = require("../service");
const utility_1 = require("../utility");
const discord_utility_1 = require("../utility/discord.utility");
const debug = (0, utility_1.Dbg)('FoodCountCancelEvent');
/**
 *
 */
const FoodCountDeleteButtonEvent = async (interaction, [idName, idCache]) => {
    // here we can use that first action name to do different stuff
    // depending on what button it is
    if (idName !== 'food-count-cancel') {
        return;
    }
    debug('food-count-cancel');
    // this kills the interaction so it doesn't report a failure
    await interaction.deferUpdate();
    const m = interaction.channel?.messages;
    const cache = _1.FoodCountInputCache.get(idCache);
    if (cache == null) {
        debug('no cache found!');
        return;
    }
    if (cache.insertTimeout != null) {
        debug('cleared insert timeout!');
        clearTimeout(cache.insertTimeout);
    }
    // delete the original input message on cancel
    // todo: consider leaving it?
    m?.fetch(cache.messageInputId).then(async (msg) => {
        _1.FoodCountInputCache.update(idCache, {
            messageInputId: ''
        });
        try {
            await msg.delete();
            debug('deleted user input message!');
        }
        catch (e) {
            console.error(e);
        }
    });
    // if the bot response has not been deleted, delete it
    // (this is the cancel button)
    if (cache.messageResponseId) {
        _1.FoodCountInputCache.update(idCache, {
            messageResponseId: ''
        });
        m?.fetch(cache.messageResponseId).then(async (msg) => {
            debug('deleted bot response message!');
            try {
                await msg.delete();
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    else {
        debug('no messageResponseId found!');
    }
    // delete any posting in the food count that came from the night channels
    if (cache.messageCountId) {
        debug('found a count channel user message');
        const countChannel = (0, discord_utility_1.GetChannelByName)(service_1.COUNT_CHANNEL_NAME, interaction.guild);
        countChannel.messages
            ?.fetch(cache.messageCountId)
            .then(async (msg) => {
            try {
                await msg.delete();
            }
            catch (e) {
                console.error(e);
            }
            debug('deleted the count channel user message');
        });
    }
    else {
        debug('no messageCountId found!');
    }
    // delete the cache
    _1.FoodCountInputCache.delete(idCache);
};
exports.FoodCountDeleteButtonEvent = FoodCountDeleteButtonEvent;

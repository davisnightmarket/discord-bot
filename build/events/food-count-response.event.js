"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountResponseEvent = void 0;
const food_count_input_event_1 = require("./food-count-input.event");
const service_1 = require("../service");
const utility_1 = require("../utility");
const discord_utility_1 = require("../utility/discord.utility");
const debug = (0, utility_1.Dbg)('FoodCountCancelEvent');
/**
 *
 */
const FoodCountResponseEvent = async (interaction) => {
    // discord event listener does not like ButtonInteraction, but
    // it makes life easier below
    interaction = interaction;
    // we set the customId of the button
    const { customId } = interaction;
    // its not a custom id
    if (!customId)
        return;
    // we gave it an action name, and a cache id
    const [idName, idCache] = customId.split('--');
    // this kills the interaction so it doesn't report a failure
    await interaction.deferUpdate();
    // here we can use that first action name to do different stuff
    // depending on what button it is
    if (idName === 'food-count-cancel') {
        const m = interaction.channel?.messages;
        const cache = food_count_input_event_1.FoodCountInputCache.get(idCache);
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
            food_count_input_event_1.FoodCountInputCache.update(idCache, {
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
            food_count_input_event_1.FoodCountInputCache.update(idCache, {
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
        food_count_input_event_1.FoodCountInputCache.delete(idCache);
    }
};
exports.FoodCountResponseEvent = FoodCountResponseEvent;

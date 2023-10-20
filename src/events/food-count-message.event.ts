import {
    type Message,
    type TextChannel,
    type ButtonInteraction,
    type Interaction
} from 'discord.js';
import { FoodCountInputCache } from './food-count-delete-button.event';

import { COUNT_CHANNEL_NAME } from '../service';
import { Dbg } from '../utility';
import { GetChannelByName } from '../utility/discord.utility';
const debug = Dbg('FoodCountCancelEvent');

/**
 *
 */
export const FoodCountMessageEvent = async (interaction: Interaction) => {
    debug('OK');
    // discord event listener does not like ButtonInteraction, but
    // it makes life easier below
    interaction = interaction as ButtonInteraction;
    // we set the customId of the button
    const { customId } = interaction;
    // its not a custom id
    if (!customId) return;
    // we gave it an action name, and a cache id
    // TODO: abstract this into a button response handler
    const [idName, idCache] = customId.split('--');

    // here we can use that first action name to do different stuff
    // depending on what button it is

    if (idName === 'food-count-cancel') {
        // this kills the interaction so it doesn't report a failure
        await interaction.deferUpdate();

        const m = (interaction.channel as TextChannel)?.messages;
        const cache = FoodCountInputCache.get(idCache);

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
        m?.fetch(cache.messageInputId).then(async (msg: Message) => {
            FoodCountInputCache.update(idCache, {
                messageInputId: ''
            });
            try {
                await msg.delete();
                debug('deleted user input message!');
            } catch (e) {
                console.error(e);
            }
        });

        // if the bot response has not been deleted, delete it
        // (this is the cancel button)
        if (cache.messageResponseId) {
            FoodCountInputCache.update(idCache, {
                messageResponseId: ''
            });
            m?.fetch(cache.messageResponseId).then(async (msg: Message) => {
                debug('deleted bot response message!');
                try {
                    await msg.delete();
                } catch (e) {
                    console.error(e);
                }
            });
        } else {
            debug('no messageResponseId found!');
        }

        // delete any posting in the food count that came from the night channels
        if (cache.messageCountId) {
            debug('found a count channel user message');
            const countChannel = GetChannelByName(
                COUNT_CHANNEL_NAME,
                interaction.guild
            );

            countChannel.messages
                ?.fetch(cache.messageCountId)
                .then(async (msg: Message) => {
                    try {
                        await msg.delete();
                    } catch (e) {
                        console.error(e);
                    }

                    debug('deleted the count channel user message');
                });
        } else {
            debug('no messageCountId found!');
        }

        // delete the cache
        FoodCountInputCache.delete(idCache);
    }
};

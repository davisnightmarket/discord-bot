import { Message } from 'discord.js';
import { PersonModel } from '../model/night-market.model';
import { NmPersonService } from '../nm-service/nm-person.service';
import { MessageService } from '../service/message.service';
import { ParseContentService } from '../service/parse-content.service';
import { Dbg } from '../service';
import { PersonMetaService } from '../nm-service/nm-person-meta.service';

const dbg = Dbg('PersonMetaEvent');

type MetaStatusType =
    | 'OK'
    | 'NONE'
    | 'EMAIL_NONE'
    | 'PHONE_NONE'
    | 'PHONE_AGAIN';

const APPROPRIATE_TIME_TO_BUG_U_IN_SECS = 1; //60 * 60 * 24 * 7,
const A_BIT_OF_LAG_BEFORE_INTROS_IN_SECS = 1; //60 * 60;

const MsgReply = MessageService.createMap({
    PERSON_FIRST_CONTACT: {
        username: ''
    },
    PERSON_REQUEST_EMAIL: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_AGAIN: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_FAIL: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_OK: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_DECLINE: {
        username: ''
    },
    PERSON_REQUEST_PHONE: {
        username: ''
    },
    PERSON_REQUEST_PHONE_OK: {
        username: ''
    },
    PERSON_REQUEST_PHONE_AGAIN: {
        username: ''
    }
});

// store person info locally
const personMetaCache: {
    [k in string]: [
        // tells us what step in the meta data collection process they are at
        MetaStatusType,
        // stores data temporarily while we step through the process
        Partial<PersonModel>,
        // this is what is in the actual database
        Partial<PersonModel>,
        number
    ];
} = {};

export const PersonMetaEvent = async (message: Message) => {
    const { channel, author } = message as Message<true>,
        NOW_IN_SECONDS = Date.now() / 1000;

    /* STAGE 1: skip the message entirely in some cases */

    // if we are a bot, we do not want to process the message
    if (author.bot) {
        return;
    }

    let { content } = message;
    // make sure there is some actual content
    // this is probably not needed since Discord does not send blanks but it's cheap so leaving it
    if (!(content = content.trim())) {
        return;
    }

    // OK, now we figure out what their data status is
    const personList = await NmPersonService.getPersonList();

    let personStore = personList.find((a) => a.discordId === message.author.id);

    const { id, username } = message.author;

    // we check if they are in the cache
    if (!personMetaCache[id]) {
        // if not, make sure to add them
        // todo: here we should get the status from looking at the personStore data
        personMetaCache[id] = [
            'NONE',
            { discordId: id, name: username },
            personStore || {},
            NOW_IN_SECONDS
        ];
    }

    const [metaStatus, personCache, _, lastContactInSeconds] =
        personMetaCache[id];

    // reset our cache timestamp
    personMetaCache[id][3] = NOW_IN_SECONDS;

    // now we find out if they are communicating directly to crabapple
    if ((channel.type as unknown as number) === 1) {
        dbg(`DM to bot meta ${metaStatus}`);
        if (metaStatus === 'NONE') {
            message.author.send(
                MsgReply.PERSON_REQUEST_EMAIL_AGAIN({ username })
            );
            return;
            // we have no record of them, so start at the beginning
        }

        const [contentStatus, parsed] =
            PersonMetaService.parseDirectReply(content);

        dbg(`DM to bot content ${contentStatus}`);
        if (contentStatus === 'DECLINE') {
            if (metaStatus === 'EMAIL_NONE') {
                message.author.send(
                    MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username })
                );
            }
        }
        if (contentStatus === 'NONE') {
            if (metaStatus === 'EMAIL_NONE') {
                message.author.send(
                    MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username })
                );
            }
        }
        if (contentStatus === 'EMAIL') {
            message.author.send(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
            message.author.send(MsgReply.PERSON_REQUEST_PHONE({ username }));
            // todo: confirm email? or just insert?
        }
        if (contentStatus === 'PHONE') {
            MsgReply.PERSON_REQUEST_PHONE_OK({ username });
            // todo: confirm? or just insert?
        }
        if (contentStatus === 'BOOL') {
            // todo: confirm? or just insert?
        }
        // we do not continue in this case, as the bot has replied
        return;
    }

    // in this case we have a general message to any channel,
    // and we want to do a check on their data, to see what state they are in

    // if we do not have a record of them, then we have never spoken to them before
    if (metaStatus === 'NONE') {
        // we want to
        // todo: set a timer and introduce ourselves
        setTimeout(() => {
            dbg('Crabble just got in touch');
            // introductions, etc
            message.author.send(MsgReply.PERSON_FIRST_CONTACT({ username }));

            // and ask for their email
            message.author.send(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        }, A_BIT_OF_LAG_BEFORE_INTROS_IN_SECS * 1000);

        dbg(
            ' if we do not have a record of them, then we have never spoken to them before'
        );
        // as soon as we have first contacted them we can start waiting for our first meta request
        personMetaCache[id][0] = 'EMAIL_NONE';
        return;
    }

    // here we have already introduced ourselves. we should check the cache for
    // a last contacted time, and only contact them if an appropriate time has elapsed
    // since last we got in touch
    if (
        NOW_IN_SECONDS - lastContactInSeconds <
        APPROPRIATE_TIME_TO_BUG_U_IN_SECS
    ) {
        dbg(
            'we do not bug you if it has not been a good amount of time since we last bugged you'
        );
        return;
    }

    if (metaStatus === 'EMAIL_NONE') {
        dbg('in this case they have never given us an email');
        console.log(MsgReply.PERSON_REQUEST_EMAIL_AGAIN({ username }));
        message.author.send(MsgReply.PERSON_REQUEST_EMAIL_AGAIN({ username }));

        return;
    }

    if (metaStatus === 'PHONE_NONE') {
        dbg('in this case they have never given us a phone');
        console.log(MsgReply.PERSON_REQUEST_PHONE({ username }));
        message.author.send(MsgReply.PERSON_REQUEST_PHONE({ username }));
        // here we have now asked them for a phone once, so we want to know that, so new status
        personMetaCache[id][0] = 'PHONE_AGAIN';
        return;
    }

    if (metaStatus === 'PHONE_AGAIN') {
        dbg('in this case they have never given us a phone again');
        console.log(MsgReply.PERSON_REQUEST_PHONE_AGAIN({ username }));
        message.author.send(MsgReply.PERSON_REQUEST_PHONE_AGAIN({ username }));
        return;
    }

    // todo: all the other questions we want to ask ...
};

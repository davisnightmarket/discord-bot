import { Message } from 'discord.js';
import { PersonModel } from '../model/night-market.model';
import { NmPersonService } from '../nm-service/nm-person.service';
import { MessageService } from '../service/message.service';
import { ParseContentService } from '../service/parse-content.service';
import { Dbg } from '../service';

const dbg = Dbg('PersonMetaEvent');

const MsgReply = MessageService.createMap({
    PERSON_REQUEST_EMAIL: {
        username: ''
    },
    // not sure why I made this
    // PERSON_REQUEST_EMAIL_AGAIN: {
    //     username: ''
    // },
    PERSON_REQUEST_EMAIL_FAIL: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_OK: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_DECLINE: {
        username: ''
    }
});

const personEnterCache: { [k in string]: Partial<PersonModel> } = {};

export const PersonMetaEvent = async (message: Message) => {
    const { channel, author } = message as Message<true>;

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

    // now we want to know if this person's meta data is stored in our db

    // OK, we are all clear, find out if this is a new person

    const personList = await NmPersonService.getPersonList();

    if (personList.findIndex((a) => a.discordId === message.author.id) >= 0) {
        // this person is in our db
        // todo: find out if they have meta data on file, etc

        // if the person has all the data required, return
        return;
    }

    // now we want to know who it is ...
    const { id, username } = message.author;

    if ((channel.type as unknown as number) === 1) {
        dbg('DM to bot');
        // in this case this is a direct message to our bot
        // we want to see if they are giving us metadata
        return;
    }

    // we check if they are in the cache

    if (!personEnterCache[id]) {
        // now we ask them for their email
        personEnterCache[id] = { discordId: id, name: username };
        // we do not want to save them to the db until we have an email address
        message.author.send(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        console.log(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        return;
    }

    const person = personEnterCache[id];

    if (!person.email) {
        console.log(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        // now we find out if this is an email
        const email = ParseContentService.getEmail(content);
        if (email) {
            person.email = email;
            // todo: now we update record and flush person list cache
            message.author.send(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
            console.log(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
        } else if (content.toLowerCase() === 'decline') {
            // otherwise we let them know and send to db
            person.email = 'decline';
            message.author.send(
                MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username })
            );
            console.log(MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username }));
        } else {
            // try again ...
            message.author.send(
                MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username })
            );
            console.log(MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username }));
        }
    }

    // now we ask for a phone
};

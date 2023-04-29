import { Message } from 'discord.js';
import { PersonModel } from '../model/night-market.model';
import { NmPersonService } from '../nm-service/nm-person.service';
import { MessageService } from '../service/message.service';
import { ParseContentService } from '../service/parse-content.service';
import { Dbg } from '../service';
import { PersonMetaService } from '../nm-service/nm-person-meta.service';

const dbg = Dbg('PersonMetaEvent');

type MetaStatusType = 'OK'|'NONE'|'EMAIL_NONE'|'PHONE_NONE'


const APPROPRIATE_TIME_TO_BUG_U = 60*60*24*7

const MsgReply = MessageService.createMap({
    PERSON_REQUEST_EMAIL: {
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
    }
});

// store person info locally 
const personMetaCache: { [k in string]: [
    // tells us what step in the meta data collection process they are at
    MetaStatusType,
    // stores data temporarily while we step through the process
    Partial<PersonModel>,
    // this is what is in the actual database
    Partial<PersonModel>,
    number
] } = {};

export const PersonMetaEvent = async (message: Message) => {

    const { channel, author } = message as Message<true>,
    NOW_IN_SECONDS = Date.now()/1000;

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

    let personStore = personList.find((a) => a.discordId === message.author.id)

    const { id, username } = message.author;

    // we check if they are in the cache
    if (!personMetaCache[id]) {

        // if not, make sure to add them
        // todo: here we should get the status from looking at the personStore data
        personMetaCache[id] = ['NONE',{ discordId: id, name: username },personStore||{},NOW_IN_SECONDS];
       
    }



    const [metaStatus,personCache,_,lastContactInSeconds] = personMetaCache[id];

    // reset our cache timestamp
    personMetaCache[id][3] = NOW_IN_SECONDS


    // now we find out if they are communicating directly to crabble
    if ((channel.type as unknown as number) === 1) {
        dbg('DM to bot');
        if(metaStatus==='NONE'){
            // we have no record of them, so start at the beginning

        }

        const [contentStatus, parsed] = PersonMetaService.parseDirectReply(content)
        if(contentStatus==='EMAIL'){
            // todo: confirm email? or just insert?
        }
        if(contentStatus==='PHONE'){
            // todo: confirm? or just insert?
        }
        if(contentStatus==='BOOL'){

            // todo: confirm? or just insert?
        }
        // we do not continue in this case, as the bot has replied
        return;
    }
    

    // in this case we have a general message to any channel, 
    // and we want to do a check on their data, to see what state they are in

    // if we do not have a record of them, then we have never spoken to them before
    if(metaStatus==='NONE'){
        // we want to 
        // todo: set a timer and introduce ourselves

        // in this case metaStatus will be NONE, so we can wait for a reply
        return 
    }

    // here we have already introduced ourselves. we should check the cache for 
    // a last contacted time, and only contact them if an appropriate time has elapsed
    // since last we got in touch
    if(NOW_IN_SECONDS -lastContactInSeconds<APPROPRIATE_TIME_TO_BUG_U){

        // we do not bug you if it has not been a good amount of time since we last bugged you
        return
    }

    if(metaStatus==='EMAIL_NONE'){
        dbg('in this case they have never given us an email')
        console.log(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        message.author.send(MsgReply.PERSON_REQUEST_EMAIL({ username }));

        // todo: this is commented out because it ought to be in the DM section - a person will only ever give meta data to crabapple in DM
        // const email = ParseContentService.getEmail(content);
        // if (email) {
        //     personCache.email = email;
        //     // todo: now we update record and flush person list cache
        //     message.author.send(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
        //     console.log(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
        // } else if (content.toLowerCase() === 'decline') {
        //     // otherwise we let them know and send to db
        //     personCache.email = 'decline';
        //     message.author.send(
        //         MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username })
        //     );
        //     console.log(MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username }));
        // } else {
        //     // try again ...
        //     message.author.send(
        //         MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username })
        //     );
        //     console.log(MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username }));
        // }
        return

    }

    if(metaStatus==='PHONE_NONE'){
        dbg('in this case they have never given us a phone')
        console.log(MsgReply.PERSON_REQUEST_PHONE({ username }));
        message.author.send(MsgReply.PERSON_REQUEST_PHONE({ username }));
        return
    }

    // etc
};

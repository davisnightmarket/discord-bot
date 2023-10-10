"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseContentService = void 0;
// so the idea of this service is that we might want a single utility for methods that
// parse content (messages) that come from discord. This is a general parser that
// gets and gives strings that are not nm related, but are utility
class ParseContentService {
    static dateFormat(date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    static getEmail(emailFuzzy) {
        const email = emailFuzzy
            .trim()
            .split(' ')
            .find((a) => a.split('@').length === 2);
        if (!email) {
            return '';
        }
        return email;
    }
    static getAmPmTimeFrom24Hour(hours24) {
        //it is pm if hours from 12 onwards
        let [hours, minutes] = hours24.split(':');
        const suffix = +hours >= 12 ? 'PM' : 'AM';
        //only -12 from hours if it is greater than 12 (if not back at mid night)
        hours = +hours > 12 ? '' + (+hours - 12) : hours;
        //if 00 then it is 12 am
        hours = hours == '00' ? '12' : hours;
        return `${hours}:${minutes} ${suffix}`;
    }
    static get24HourTimeFromAmPm(amPm) {
        const [time, modifier] = amPm.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = `` + parseInt(hours, 10) + 12;
        }
        return `${hours}:${minutes}`;
    }
}
exports.ParseContentService = ParseContentService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonMetaService = void 0;
class PersonMetaService {
    static parseDirectReply(content) {
        content = content.toLowerCase();
        let parsed = '';
        if (content.split('@').length === 2) {
            // in case they wrote a sentence with an email in it
            parsed =
                content.split(' ').find((b) => b.split('@').length === 2) || '';
            return ['EMAIL', parsed];
        }
        if (content.toLowerCase() === 'decline') {
            // in case they wrote a sentence with an email in it
            parsed =
                content.split(' ').find((b) => b.split('@').length === 2) || '';
            return ['DECLINE', 'decline'];
        }
        // todo: phone and boolean
        return ['NONE', parsed];
    }
}
exports.PersonMetaService = PersonMetaService;

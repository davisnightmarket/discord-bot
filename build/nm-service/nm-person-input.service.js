"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonInputService = void 0;
class PersonInputService {
    static parseDirectReply(content) {
        var _a, _b;
        content = content.toLowerCase();
        let parsed = '';
        if (content.split('@').length === 2) {
            // in case they wrote a sentence with an email in it
            parsed =
                (_a = content.split(' ').find((b) => b.split('@').length === 2)) !== null && _a !== void 0 ? _a : '';
            return ['EMAIL', parsed];
        }
        if (content.toLowerCase() === 'decline') {
            // in case they wrote a sentence with an email in it
            parsed =
                (_b = content.split(' ').find((b) => b.split('@').length === 2)) !== null && _b !== void 0 ? _b : '';
            return ['DECLINE', 'decline'];
        }
        // todo: phone and boolean
        return ['NONE', parsed];
    }
}
exports.PersonInputService = PersonInputService;

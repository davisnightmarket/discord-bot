type ReplyStatusType = 'EMAIL' | 'PHONE' | 'BOOL' | 'NONE' | 'DECLINE';

export class PersonMetaService {
    static parseDirectReply(content: string): [ReplyStatusType, string] {
        content = content.toLowerCase();
        let parsed: string = '';
        if (content.split('@').length === 2) {
            // in case they wrote a sentence with an email in it
            parsed =
                content.split(' ').find((b) => b.split('@').length === 2) ?? '';
            return ['EMAIL', parsed];
        }
        if (content.toLowerCase() === 'decline') {
            // in case they wrote a sentence with an email in it
            parsed =
                content.split(' ').find((b) => b.split('@').length === 2) ?? '';
            return ['DECLINE', 'decline'];
        }
        // todo: phone and boolean

        return ['NONE', parsed];
    }
}

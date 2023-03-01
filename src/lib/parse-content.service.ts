import dateFormat from 'dateformat';
export class ParseContentService {
    static getLbsAndString(content: string): [number, string] {
        const contentList = content.split(' ').filter((a: string) => a.trim());
        let lbsCount = ParseContentService.getNumberFromStringStart(
            contentList[0]
        );
        // in this case the number was first
        if (lbsCount) {
            // get rid of the number
            contentList.shift();
            // get rid of any lbs or pounds text
            if (
                contentList[0].toLowerCase() === 'lbs' ||
                contentList[0].toLowerCase() === 'pounds'
            ) {
                contentList.shift();
            }
            return [lbsCount, contentList.join(' ')];
        }

        // in this case the number was last
        lbsCount = ParseContentService.getNumberFromStringStart(
            contentList[contentList.length - 1]
        );
        if (lbsCount) {
            // get rid of the number
            contentList.shift();
            return [lbsCount, contentList.join(' ')];
        }

        // in this case the number was second to last, and it needs to be followed by a lbs or pounds
        lbsCount = ParseContentService.getNumberFromStringStart(
            contentList[contentList.length - 2]
        );
        if (lbsCount) {
            if (
                contentList[0].toLowerCase() === 'lbs' ||
                contentList[0].toLowerCase() === 'pounds'
            ) {
                // get rid of the pounds or lbs
                contentList.shift();
                // get rid of the number
                contentList.shift();
                return [lbsCount, contentList.join(' ')];
            }
        }
        // in this case there was no number, so we return a falsy zero and let them pick one
        return [lbsCount || 0, contentList.join(' ')];
    }
    static getNumberFromStringStart(s: string): number {
        let c = 0;
        for (let a = 0; a < s.length; a++) {
            // if the first char is not a number, return zero
            const b = +s[a];
            if (!a && isNaN(b)) {
                a = s.length;
            } else {
                if (!isNaN(b)) {
                    c = +(c + '' + b);
                }
            }
        }
        return c;
    }

    // simply parse for a date that looks like MM/DD or MM/DD/YYYY

    // todo: i think this sucks. there must be an easier way to do this, like just ask them for the date in the confirm?
    static getDateFromString(s: string): [string, string] {
        let n = '';
        const d = new Date();
        const t = s.split(' ').filter((a) => a);
        const i = t.findIndex((a) => a.split('/').length > 1);
        if (i >= 0) {
            // there is a date proper in here, let us take it off of t
            const u = t.splice(i, 1).pop() || '';
            const v = u.split('/');
            if (v.length === 2) {
                if (v[0].length === 2 && v[1].length === 2) {
                    // ok good enough
                    n = v.join('/') + '/' + d.getFullYear();
                }
            } else if (v.length === 3) {
                if (
                    v[0].length === 2 &&
                    v[1].length === 2 &&
                    v[2].length === 4
                ) {
                    // ok good enough
                    n = v.join('/');
                }
            }
        }

        return [
            n || dateFormat(new Date(), 'mm/dd/yyyyy'),
            // at this point t has had the date string removed
            t.join(' ')
        ];
    }
}
